"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const access_1 = require("../../functions/access");
const hidden_1 = require("../../functions/hidden");
const lookup_1 = require("../../functions/lookup");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$getField",
    version: "1.0.0",
    description: "Returns a field of an instance",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("variable", "The instance variable"), forgescript_1.Arg.requiredString("field", "The field name")],
    output: forgescript_1.ArgType.Unknown,
    execute(ctx, [variable, field]) {
        const classes = ctx.client.classes;
        const found = (0, lookup_1.instanceIn)(ctx, variable);
        if (!found.ok)
            return this.customError(found.reason);
        const { instance, def } = found.value;
        if ((0, __1.isHidden)(field)) {
            const owner = (0, hidden_1.hiddenField)(ctx, def, field);
            if (!owner.ok)
                return this.customError(owner.reason);
            return this.success((0, value_1.toText)(classes.hiddenOf(instance).get((0, hidden_1.slotOf)(owner.value, field))) ?? null);
        }
        const member = classes.fieldOf(def, field);
        if (!member)
            return this.customError(`${def.name} has no field ${field}.`);
        if (!(0, access_1.canReach)(ctx, member.owner, member.access)) {
            return this.customError((0, access_1.unreachable)(member.owner, field, member.access));
        }
        // missing on instances made before the class got the field
        const value = Object.hasOwn(instance, field) ? instance[field] : undefined;
        return this.success((0, value_1.toText)(value) ?? null);
    },
});
//# sourceMappingURL=getField.js.map