"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const scope_1 = require("../../functions/scope");
exports.default = new forgescript_1.NativeFunction({
    name: "$param",
    version: "1.0.0",
    description: "Declares a typed param, in the params of $method or $constructor",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("name", "The param name"),
        forgescript_1.Arg.requiredEnum(__1.ParamType, "type", "The param type"),
        forgescript_1.Arg.optionalBoolean("required", "Whether it must be given, true by default"),
        forgescript_1.Arg.optionalBoolean("rest", "Whether it takes all the remaining args, false by default"),
    ],
    output: forgescript_1.ArgType.String,
    execute(ctx, [name, type, required, rest]) {
        const params = ctx[scope_1.PARAMS];
        if (!params)
            return this.customError("$param can only be used in the params of $method or $constructor.");
        params.set(name, { type, required: required ?? true, rest: rest ?? false });
        return this.success(name);
    },
});
//# sourceMappingURL=param.js.map