"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const args_1 = require("../../functions/args");
const scope_1 = require("../../functions/scope");
exports.default = new forgescript_1.NativeFunction({
    name: "$constructor",
    version: "1.0.0",
    description: "Declares the class constructor",
    unwrap: false,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("code", "The constructor code"), (0, args_1.optionalRest)("params", "The constructor params")],
    async execute(ctx) {
        const def = ctx[scope_1.BUILDER];
        if (!def)
            return this.customError("$constructor can only be used inside $class.");
        const code = this.data.fields[0];
        const types = new Map();
        let resolved;
        ctx[scope_1.PARAMS] = types;
        try {
            resolved = await this["resolveMultipleArgs"](ctx, 1);
        }
        finally {
            ctx[scope_1.PARAMS] = undefined;
        }
        const { args, return: rt } = resolved;
        if (!this["isValidReturnType"](rt))
            return rt;
        const [params] = args;
        const typed = params.map((param) => ({ name: param, ...types.get(param) }));
        const added = def.addMethod(__1.CONSTRUCTOR, typed, new __1.Body(code));
        if (!added.ok)
            return this.customError(added.reason);
        return this.success();
    },
});
//# sourceMappingURL=constructor.js.map