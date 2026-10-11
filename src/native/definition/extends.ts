import { Arg, NativeFunction } from "@tryforge/forgescript"
import { BUILDER } from "../../functions/scope"

export default new NativeFunction({
    name: "$extends",
    version: "1.0.0",
    description: "Sets the parent class",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("parent", "The parent class name")],
    execute(ctx, [parent]) {
        const def = ctx[BUILDER]
        if (!def) return this.customError("$extends can only be used inside $class.")

        const extended = def.extend(parent)
        if (!extended.ok) return this.customError(extended.reason)

        return this.success()
    },
})
