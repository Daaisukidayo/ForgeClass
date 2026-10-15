import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { canReach, unreachable } from "../../functions/access"
import { classNamed } from "../../functions/lookup"
import { staticOf } from "../../functions/run"
import { toText } from "../../functions/value"

export default new NativeFunction({
    name: "$getStatic",
    version: "1.1.0",
    description: "Returns a static field of a class",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("class", "The class name"), Arg.requiredString("field", "The static field name")],
    output: ArgType.Unknown,
    async execute(ctx, [name, field]) {
        const def = classNamed(ctx.client.classes, name)
        if (!def.ok) return this.customError(def.reason)

        const member = ctx.client.classes.staticFieldOf(def.value, field)
        if (!member) return this.customError(`${def.value.name} has no static field ${field}.`)
        if (!canReach(ctx, member.owner, member.access)) {
            return this.customError(unreachable(member.owner, field, member.access))
        }

        const rt = await staticOf(this, ctx, member.owner, field, member.body)
        if (!rt.success) return rt

        return this.success(toText(rt.value) ?? null)
    },
})
