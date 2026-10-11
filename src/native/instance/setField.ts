import { Arg, NativeFunction } from "@tryforge/forgescript"
import { CLASS_KEY, isHidden } from "../.."
import { hiddenField, slotOf } from "../../functions/hidden"
import { instanceIn } from "../../functions/lookup"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$setField",
    version: "1.0.0",
    description: "Sets a field of an instance",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The instance variable"),
        Arg.requiredString("field", "The field name"),
        Arg.requiredString("value", "The new value"),
    ],
    execute(ctx, [variable, field, value]) {
        const classes = ctx.client.classes

        const found = instanceIn(ctx, variable)
        if (!found.ok) return this.customError(found.reason)
        const { instance, def } = found.value

        if (isHidden(field)) {
            const owner = hiddenField(ctx, def, field)
            if (!owner.ok) return this.customError(owner.reason)

            classes.hiddenOf(instance).set(slotOf(owner.value, field), parseValue(value))
            return this.success()
        }

        if (field === CLASS_KEY) return this.customError(`"${CLASS_KEY}" holds the class name and can't be changed.`)
        if (!classes.declares(def, field)) return this.customError(`${def.name} has no field ${field}.`)

        instance[field] = parseValue(value)
        return this.success()
    },
})
