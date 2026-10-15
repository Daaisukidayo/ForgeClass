import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { canReach, unreachable } from "../../functions/access"
import { optionalRest } from "../../functions/args"
import { classNamed } from "../../functions/lookup"
import { runMethod } from "../../functions/run"

export default new NativeFunction({
    name: "$callStatic",
    version: "1.1.0",
    description: "Calls a static method of a class",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("class", "The class name"),
        Arg.requiredString("method", "The static method name"),
        optionalRest("args", "The method args"),
    ],
    output: ArgType.Unknown,
    async execute(ctx, [name, method, args]) {
        const classes = ctx.client.classes

        const def = classNamed(classes, name)
        if (!def.ok) return this.customError(def.reason)

        const member = classes.staticMethodOf(def.value, method)
        if (!member) {
            return this.customError(
                classes.findMethod(def.value, method)
                    ? `${def.value.name}.${method} isn't static, call it on an instance with $callMethod.`
                    : `${def.value.name} has no static method ${method}.`
            )
        }
        if (!canReach(ctx, member.owner, member.access)) {
            return this.customError(unreachable(member.owner, method, member.access))
        }

        const rt = await runMethod(this, ctx, null, member, args)
        if (!rt.success) return rt

        return this.success(rt.value)
    },
})
