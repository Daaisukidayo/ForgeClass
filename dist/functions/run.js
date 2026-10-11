"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failureOf = failureOf;
exports.runMethod = runMethod;
exports.construct = construct;
const forgescript_1 = require("@tryforge/forgescript");
const structures_1 = require("../structures");
const hidden_1 = require("./hidden");
const params_1 = require("./params");
const scope_1 = require("./scope");
const value_1 = require("./value");
function failureOf(fn, rt, where, allowReturn = true) {
    if (rt.success || (rt.return && allowReturn))
        return null;
    if (rt.return)
        return fn.customError(`$return can't be used in ${where}.`);
    if (rt.break || rt.continue) {
        return fn.customError(`$${rt.break ? "break" : "continue"} is not inside a loop in ${where}.`);
    }
    return rt;
}
async function runIn(fn, scope, body, where, allowReturn = true) {
    let code;
    try {
        code = body.code;
    }
    catch (err) {
        return fn.customError(`Could not compile ${where}: ${err instanceof Error ? err.message : String(err)}`);
    }
    const rt = await fn["resolveCode"](scope, code);
    return failureOf(fn, rt, where, allowReturn) ?? new forgescript_1.Return(forgescript_1.ReturnType.Success, rt.value);
}
async function runMethod(fn, ctx, instance, method, args) {
    const where = method.owner.describeMethod(method.name);
    const { min, max } = (0, params_1.arityOf)(method.params);
    if (args.length < min || args.length > max) {
        const short = args.length < min;
        const wanted = min === max ? `${min}` : short ? `at least ${min}` : `at most ${max}`;
        const count = short ? min : max;
        return fn.customError(`${where} takes ${wanted} argument${count === 1 ? "" : "s"}, got ${args.length}.`);
    }
    const values = await (0, params_1.valuesOf)(fn, ctx, method.params, args);
    if (!values.success)
        return values;
    const scope = ctx.clone();
    scope.setEnvironmentKey("this", instance);
    method.params.forEach((param, i) => scope.setEnvironmentKey(param.name, values.value[i]));
    scope[scope_1.FRAME] = { owner: method.owner, instance };
    return runIn(fn, scope, method.body, where);
}
/** Field defaults from the root class down, then the constructor. Succeeds with the instance. */
async function construct(fn, ctx, def, args) {
    const classes = ctx.client.classes;
    const instance = { [structures_1.CLASS_KEY]: def.name };
    const scope = ctx.clone();
    scope.setEnvironmentKey("this", instance);
    for (const [field, { owner, body }] of classes.fieldsOf(def)) {
        const rt = await runIn(fn, scope, body, `the default of ${owner.name}.${field}`, false);
        if (!rt.success)
            return rt;
        instance[field] = (0, value_1.parseValue)(String(rt.value ?? ""));
    }
    for (const owner of classes.chainOf(def).reverse()) {
        if (!owner.hiddenFields.size)
            continue;
        // as the class's own code, so its defaults reach its other # fields
        const own = ctx.clone();
        own.setEnvironmentKey("this", instance);
        own[scope_1.FRAME] = { owner, instance };
        for (const [field, body] of owner.hiddenFields) {
            const rt = await runIn(fn, own, body, `the default of ${owner.name}.${field}`, false);
            if (!rt.success)
                return rt;
            classes.hiddenOf(instance).set((0, hidden_1.slotOf)(owner, field), (0, value_1.parseValue)(String(rt.value ?? "")));
        }
    }
    const constructor = classes.findMethod(def, structures_1.CONSTRUCTOR);
    if (constructor) {
        const rt = await runMethod(fn, ctx, instance, constructor, args);
        if (!rt.success)
            return rt;
    }
    else if (args.length) {
        return fn.customError(`${def.name} has no constructor, so it takes no arguments, got ${args.length}.`);
    }
    return new forgescript_1.Return(forgescript_1.ReturnType.Success, instance);
}
//# sourceMappingURL=run.js.map