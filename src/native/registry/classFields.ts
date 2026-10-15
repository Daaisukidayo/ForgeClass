import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { classNamed } from "../../functions/lookup"
import { stringify } from "../../functions/value"

export default new NativeFunction({
    name: "$classFields",
    version: "1.0.0",
    description: "Returns the fields of a class as JSON",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("class", "The class name")],
    output: ArgType.Json,
    execute(ctx, [name]) {
        const classes = ctx.client.classes

        const def = classNamed(classes, name)
        if (!def.ok) return this.customError(def.reason)

        const fields = [...classes.fieldsOf(def.value)].filter(([, field]) => field.access === "public")
        return this.success(stringify(fields.map(([name]) => name)))
    },
})
