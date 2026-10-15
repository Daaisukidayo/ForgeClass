import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { fieldsOf } from "../.."
import { canReach } from "../../functions/access"
import { instanceIn } from "../../functions/lookup"
import { stringify } from "../../functions/value"

export default new NativeFunction({
    name: "$instanceFields",
    version: "1.0.0",
    description: "Returns the fields of an instance as JSON",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("variable", "The instance variable")],
    output: ArgType.Json,
    execute(ctx, [variable]) {
        const found = instanceIn(ctx, variable)
        if (!found.ok) return this.customError(found.reason)
        const { instance, def } = found.value

        const shown = Object.entries(fieldsOf(instance)).filter(([name]) => {
            const member = ctx.client.classes.fieldOf(def, name)
            return !member || canReach(ctx, member.owner, member.access)
        })

        return this.success(stringify(Object.fromEntries(shown)))
    },
})
