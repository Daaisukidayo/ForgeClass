import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { classNamed } from "../../functions/lookup"
import { stringify } from "../../functions/value"

export default new NativeFunction({
    name: "$classMethods",
    version: "1.0.0",
    description: "Returns the methods of a class as JSON",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("class", "The class name")],
    output: ArgType.Json,
    execute(ctx, [name]) {
        const classes = ctx.client.classes

        const def = classNamed(classes, name)
        if (!def.ok) return this.customError(def.reason)

        return this.success(stringify(classes.methodNamesOf(def.value)))
    },
})
