import { Arg, NativeFunction } from "@tryforge/forgescript"
import { optionalRest } from "../../functions/args"
import { checkName } from "../../functions/keys"
import { classNamed } from "../../functions/lookup"
import { construct } from "../../functions/run"

export default new NativeFunction({
    name: "$new",
    version: "1.0.0",
    description: "Creates an instance of a class",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("variable", "The variable to store it in"),
        Arg.requiredString("class", "The class name"),
        optionalRest("args", "The constructor args"),
    ],
    async execute(ctx, [variable, name, args]) {
        const checked = checkName(variable, "a variable name")
        if (!checked.ok) return this.customError(checked.reason)
        if (variable === "this") return this.customError(`"this" is the instance a method runs on, pick another name.`)

        const classes = ctx.client.classes

        const def = classNamed(classes, name)
        if (!def.ok) return this.customError(def.reason)

        const built = await construct(this, ctx, def.value, args)
        if (!built.success) return built

        ctx.setEnvironmentKey(variable, built.value)
        return this.success()
    },
})
