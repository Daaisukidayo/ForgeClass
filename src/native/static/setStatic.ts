import { Arg, NativeFunction } from "@tryforge/forgescript"
import { canReach, unreachable } from "../../functions/access"
import { classNamed } from "../../functions/lookup"
import { parseValue } from "../../functions/value"

export default new NativeFunction({
    name: "$setStatic",
    version: "1.1.0",
    description: "Sets a static field of a class",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("class", "The class name"),
        Arg.requiredString("field", "The static field name"),
        Arg.requiredString("value", "The new value"),
    ],
    execute(ctx, [name, field, value]) {
        const def = classNamed(ctx.client.classes, name)
        if (!def.ok) return this.customError(def.reason)

        const member = ctx.client.classes.staticFieldOf(def.value, field)
        if (!member) return this.customError(`${def.value.name} has no static field ${field}.`)
        if (!canReach(ctx, member.owner, member.access)) {
            return this.customError(unreachable(member.owner, field, member.access))
        }
        if (member.readonly) return this.customError(`${member.owner.name}.${field} is readonly.`)

        member.owner.statics.set(field, parseValue(value))
        return this.success()
    },
})
