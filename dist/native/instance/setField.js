"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const access_1 = require("../../functions/access");
const hidden_1 = require("../../functions/hidden");
const lookup_1 = require("../../functions/lookup");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$setField",
    version: "1.0.0",
    description: "Sets a field of an instance",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The instance variable"),
        forgescript_1.Arg.requiredString("field", "The field name"),
        forgescript_1.Arg.requiredString("value", "The new value"),
    ],
    execute(ctx, [variable, field, value]) {
        const classes = ctx.client.classes;
        const found = (0, lookup_1.instanceIn)(ctx, variable);
        if (!found.ok)
            return this.customError(found.reason);
        const { instance, def } = found.value;
        if ((0, __1.isHidden)(field)) {
            const owner = (0, hidden_1.hiddenField)(ctx, def, field);
            if (!owner.ok)
                return this.customError(owner.reason);
            if (owner.value.hiddenFields.get(field)?.readonly && !(0, access_1.canWrite)(ctx, instance)) {
                return this.customError(`${owner.value.name}.${field} is readonly.`);
            }
            classes.hiddenOf(instance).set((0, hidden_1.slotOf)(owner.value, field), (0, value_1.parseValue)(value));
            return this.success();
        }
        if (field === __1.CLASS_KEY)
            return this.customError(`"${__1.CLASS_KEY}" holds the class name and can't be changed.`);
        const member = classes.fieldOf(def, field);
        if (!member)
            return this.customError(`${def.name} has no field ${field}.`);
        if (!(0, access_1.canReach)(ctx, member.owner, member.access)) {
            return this.customError((0, access_1.unreachable)(member.owner, field, member.access));
        }
        if (member.readonly && !(0, access_1.canWrite)(ctx, instance))
            return this.customError(`${member.owner.name}.${field} is readonly.`);
        instance[field] = (0, value_1.parseValue)(value);
        return this.success();
    },
});
//# sourceMappingURL=setField.js.map