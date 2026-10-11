"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const lookup_1 = require("../../functions/lookup");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$instanceFields",
    version: "1.0.0",
    description: "Returns the fields of an instance as JSON",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("variable", "The instance variable")],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [variable]) {
        const found = (0, lookup_1.instanceIn)(ctx, variable);
        if (!found.ok)
            return this.customError(found.reason);
        return this.success((0, value_1.stringify)((0, __1.fieldsOf)(found.value.instance)));
    },
});
//# sourceMappingURL=instanceFields.js.map