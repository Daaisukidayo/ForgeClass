import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { isHidden } from "../.."
import { canReach, unreachable } from "../../functions/access"
import { hiddenField, slotOf } from "../../functions/hidden"
import { instanceIn } from "../../functions/lookup"
import { toText } from "../../functions/value"

export default new NativeFunction({
    name: "$getField",
    version: "1.0.0",
    description: "Returns a field of an instance",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("variable", "The instance variable"), Arg.requiredString("field", "The field name")],
    output: ArgType.Unknown,
    execute(ctx, [variable, field]) {
        const classes = ctx.client.classes

        const found = instanceIn(ctx, variable)
        if (!found.ok) return this.customError(found.reason)
        const { instance, def } = found.value

        if (isHidden(field)) {
            const owner = hiddenField(ctx, def, field)
            if (!owner.ok) return this.customError(owner.reason)

            return this.success(toText(classes.hiddenOf(instance).get(slotOf(owner.value, field))) ?? null)
        }

        const member = classes.fieldOf(def, field)
        if (!member) return this.customError(`${def.name} has no field ${field}.`)
        if (!canReach(ctx, member.owner, member.access)) {
            return this.customError(unreachable(member.owner, field, member.access))
        }

        // missing on instances made before the class got the field
        const value = Object.hasOwn(instance, field) ? instance[field] : undefined
        return this.success(toText(value) ?? null)
    },
})
