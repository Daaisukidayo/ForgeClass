"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const access_1 = require("../../functions/access");
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
        const { instance, def } = found.value;
        const shown = Object.entries((0, __1.fieldsOf)(instance)).filter(([name]) => {
            const member = ctx.client.classes.fieldOf(def, name);
            return !member || (0, access_1.canReach)(ctx, member.owner, member.access);
        });
        return this.success((0, value_1.stringify)(Object.fromEntries(shown)));
    },
});
//# sourceMappingURL=instanceFields.js.map