"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const scope_1 = require("../../functions/scope");
exports.default = new forgescript_1.NativeFunction({
    name: "$field",
    version: "1.0.0",
    description: "Declares a class field",
    unwrap: false,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("name", "The field name"), forgescript_1.Arg.optionalString("default", "The default value")],
    async execute(ctx) {
        const def = ctx[scope_1.BUILDER];
        if (!def)
            return this.customError("$field can only be used inside $class.");
        const init = this.data.fields[1];
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0);
        if (!this["isValidReturnType"](rt))
            return rt;
        const [name] = args;
        const added = def.addField(name, new __1.Body(init ?? ""));
        if (!added.ok)
            return this.customError(added.reason);
        return this.success();
    },
});
//# sourceMappingURL=field.js.map