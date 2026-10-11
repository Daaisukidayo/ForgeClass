import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { isHidden } from "../.."
import { hasHiddenField } from "../../functions/hidden"
import { instanceIn } from "../../functions/lookup"

export default new NativeFunction({
    name: "$hasField",
    version: "1.0.0",
    description: "Checks whether an instance has a field, returns bool",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("variable", "The instance variable"), Arg.requiredString("field", "The field name")],
    output: ArgType.Boolean,
    execute(ctx, [variable, field]) {
        const classes = ctx.client.classes

        const found = instanceIn(ctx, variable)
        if (!found.ok) return this.customError(found.reason)

        const { def } = found.value

        if (isHidden(field)) {
            const has = hasHiddenField(ctx, def, field)
            return has.ok ? this.success(has.value) : this.customError(has.reason)
        }

        return this.success(classes.declares(def, field))
    },
})
