import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { classNamed } from "../../functions/lookup"

export default new NativeFunction({
    name: "$classParent",
    version: "1.0.0",
    description: "Returns the parent class name",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("class", "The class name")],
    output: ArgType.String,
    execute(ctx, [name]) {
        const def = classNamed(ctx.client.classes, name)
        if (!def.ok) return this.customError(def.reason)

        return this.success(def.value.parent)
    },
})
