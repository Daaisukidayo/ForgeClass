"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failureOf = failureOf;
exports.runMethod = runMethod;
exports.construct = construct;
exports.staticOf = staticOf;
const forgescript_1 = require("@tryforge/forgescript");
const node_async_hooks_1 = require("node:async_hooks");
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
    if (instance)
        scope.setEnvironmentKey("this", instance);
    method.params.forEach((param, i) => scope.setEnvironmentKey(param.name, values.value[i]));
    scope[scope_1.FRAME] = { owner: method.owner, instance, method: method.name };
    return runIn(fn, scope, method.body, where);
}
/** Field defaults from the root class down, then the constructor. Succeeds with the instance. */
async function construct(fn, ctx, def, args) {
    const classes = ctx.client.classes;
    const instance = { [structures_1.CLASS_KEY]: def.name };
    const scope = ctx.clone();
    scope.setEnvironmentKey("this", instance);
    for (const [field, { owner, body }] of classes.fieldsOf(def)) {
        scope[scope_1.FRAME] = { owner, instance, method: null };
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
        own[scope_1.FRAME] = { owner, instance, method: null };
        for (const [field, { body }] of owner.hiddenFields) {
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
// what this run is filling, so a default reading its own field errors instead of looping
const filling = new node_async_hooks_1.AsyncLocalStorage();
/** A static field's value, its default run on first use. */
async function staticOf(fn, ctx, owner, name, body) {
    if (owner.statics.has(name))
        return new forgescript_1.Return(forgescript_1.ReturnType.Success, owner.statics.get(name));
    const where = `${owner.name}.${name}`;
    if (filling.getStore()?.has(where))
        return fn.customError(`${where} is read in its own default.`);
    const scope = ctx.clone();
    scope[scope_1.FRAME] = { owner, instance: null, method: null };
    const rt = await filling.run(new Set(filling.getStore()).add(where), () => runIn(fn, scope, body, `the default of ${where}`, false));
    if (!rt.success)
        return rt;
    if (!owner.statics.has(name))
        owner.statics.set(name, (0, value_1.parseValue)(String(rt.value ?? "")));
    return new forgescript_1.Return(forgescript_1.ReturnType.Success, owner.statics.get(name));
}
//# sourceMappingURL=run.js.map