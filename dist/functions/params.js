"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toParams = toParams;
exports.arityOf = arityOf;
exports.valuesOf = valuesOf;
const forgescript_1 = require("@tryforge/forgescript");
const result_1 = require("./result");
/** Checks the params and fills in their defaults: `String`, required, not rest. */
function toParams(inputs) {
    const params = [];
    for (const [i, input] of inputs.entries()) {
        const data = typeof input === "string" ? { name: input } : input;
        if (typeof data?.name !== "string")
            return (0, result_1.fail)("A param has no name.");
        const type = typeOf(data.type);
        if (type === null)
            return (0, result_1.fail)(`"${data.type}" is not a type, in param ${data.name}.`);
        if (type === forgescript_1.ArgType.Enum)
            return (0, result_1.fail)(`Param ${data.name} can't be an Enum, it has no values to pick from.`);
        const param = { name: data.name, type, required: data.required ?? true, rest: data.rest ?? false };
        if (param.rest && i !== inputs.length - 1)
            return (0, result_1.fail)(`Only the last param can be rest, not ${param.name}.`);
        if (param.required && params.some((before) => !before.required)) {
            return (0, result_1.fail)(`The required param ${param.name} can't come after an optional one.`);
        }
        params.push(param);
    }
    return (0, result_1.ok)(params);
}
/** An ArgType from its number or name, or null when there's none. */
function typeOf(type) {
    if (type === undefined)
        return forgescript_1.ArgType.String;
    if (typeof type === "number")
        return forgescript_1.ArgType[type] === undefined ? null : type;
    const value = Object.hasOwn(forgescript_1.ArgType, type) ? forgescript_1.ArgType[type] : undefined;
    return typeof value === "number" ? value : null;
}
/** How many args a method takes. */
function arityOf(params) {
    return {
        min: params.filter((param) => param.required).length,
        max: params.at(-1)?.rest ? Infinity : params.length,
    };
}
/** One value per param, the rest one as an array. Typed args are converted the way ForgeScript converts its own. */
async function valuesOf(fn, ctx, params, args) {
    const values = [];
    for (const [i, param] of params.entries()) {
        if (param.rest) {
            const rest = [];
            for (const text of args.slice(i)) {
                const rt = await valueOf(fn, ctx, param, text);
                if (!rt.success)
                    return rt;
                rest.push(rt.value);
            }
            values.push(rest);
        }
        else if (i < args.length) {
            const rt = await valueOf(fn, ctx, param, args[i]);
            if (!rt.success)
                return rt;
            values.push(rt.value);
        }
        else {
            values.push(undefined);
        }
    }
    return new forgescript_1.Return(forgescript_1.ReturnType.Success, values);
}
/** One arg converted to its param's type. `String` ones stay as they are. */
async function valueOf(fn, ctx, param, text) {
    if (param.type === forgescript_1.ArgType.String)
        return new forgescript_1.Return(forgescript_1.ReturnType.Success, text);
    const arg = { name: param.name, description: "", type: param.type, required: param.required, rest: false };
    return fn["resolveArg"](ctx, arg, {}, text, []);
}
//# sourceMappingURL=params.js.map