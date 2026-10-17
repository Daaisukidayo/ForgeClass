import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { CONSTRUCTOR, isHidden } from "../.."
import { canReach } from "../../functions/access"
import { hasHiddenMethod } from "../../functions/hidden"
import { instanceIn } from "../../functions/lookup"

export default new NativeFunction({
    name: "$hasMethod",
    version: "1.2.0",
    description: "Checks whether an instance has a method, returns bool",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("variable", "The instance variable"), Arg.requiredString("method", "The method name")],
    output: ArgType.Boolean,
    execute(ctx, [variable, method]) {
        const classes = ctx.client.classes

        const found = instanceIn(ctx, variable)
        if (!found.ok) return this.customError(found.reason)

        const { def } = found.value

        if (isHidden(method)) {
            const has = hasHiddenMethod(ctx, def, method)
            return has.ok ? this.success(has.value) : this.customError(has.reason)
        }

        const member = method === CONSTRUCTOR ? null : classes.findMethod(def, method)
        return this.success(member !== null && canReach(ctx, member.owner, member.access))
    },
})
