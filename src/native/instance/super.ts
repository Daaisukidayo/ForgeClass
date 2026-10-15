import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { CONSTRUCTOR } from "../.."
import { canReach, unreachable } from "../../functions/access"
import { optionalRest } from "../../functions/args"
import { FRAME } from "../../functions/scope"
import { runMethod } from "../../functions/run"

export default new NativeFunction({
    name: "$super",
    version: "1.0.0",
    description: "Calls a parent class method",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("method", "The method name"), optionalRest("args", "The method args")],
    output: ArgType.Unknown,
    async execute(ctx, [name, args]) {
        const frame = ctx[FRAME]
        if (!frame) return this.customError(`${this.fn.name} can only be used inside a method.`)

        const { owner, instance, method: running } = frame
        if (owner.parent === null) return this.customError(`${owner.name} has no parent class.`)

        // anywhere else, it could set readonly fields again
        if (name === CONSTRUCTOR && running !== CONSTRUCTOR) {
            return this.customError(`${this.fn.name}[constructor] can only be used in a constructor.`)
        }

        const classes = ctx.client.classes

        const parent = classes.get(owner.parent)
        if (!parent) return this.customError(`${owner.name} extends ${owner.parent}, which is not defined.`)

        const method = instance ? classes.findMethod(parent, name) : classes.staticMethodOf(parent, name)
        if (!method) {
            const missing = name === CONSTRUCTOR ? "constructor" : `${instance ? "" : "static "}method ${name}`
            return this.customError(`${parent.name} has no ${missing}.`)
        }
        if (!canReach(ctx, method.owner, method.access)) {
            return this.customError(unreachable(method.owner, name, method.access))
        }

        const rt = await runMethod(this, ctx, instance, method, args)
        if (!rt.success) return rt

        return this.success(rt.value)
    },
})
