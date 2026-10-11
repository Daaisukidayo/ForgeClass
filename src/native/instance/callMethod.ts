import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { CONSTRUCTOR, isHidden } from "../.."
import { optionalRest } from "../../functions/args"
import { hiddenMethod } from "../../functions/hidden"
import { instanceIn } from "../../functions/lookup"
import { runMethod } from "../../functions/run"

export default new NativeFunction({
    name: "$callMethod",
    version: "1.0.0",
    description: "Calls a method of an instance",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The instance variable"),
        Arg.requiredString("method", "The method name"),
        optionalRest("args", "The method args"),
    ],
    output: ArgType.Unknown,
    async execute(ctx, [variable, name, args]) {
        const classes = ctx.client.classes

        const found = instanceIn(ctx, variable)
        if (!found.ok) return this.customError(found.reason)
        const { instance, def } = found.value

        if (name === CONSTRUCTOR) {
            return this.customError("The constructor runs from $new, or from a child's constructor through $super.")
        }

        let method

        if (isHidden(name)) {
            const found = hiddenMethod(ctx, def, name)
            if (!found.ok) return this.customError(found.reason)
            method = found.value
        } else {
            method = classes.findMethod(def, name)
            if (!method) return this.customError(`${def.name} has no method ${name}.`)
        }

        const rt = await runMethod(this, ctx, instance, method, args)
        if (!rt.success) return rt

        return this.success(rt.value)
    },
})
