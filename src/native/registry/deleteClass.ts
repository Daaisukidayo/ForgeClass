import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"

export default new NativeFunction({
    name: "$deleteClass",
    version: "1.0.0",
    description: "Deletes a class, returns bool",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("class", "The class name")],
    output: ArgType.Boolean,
    execute(ctx, [name]) {
        const deleted = ctx.client.classes.delete(name)
        if (!deleted.ok) return this.customError(deleted.reason)

        return this.success(deleted.value)
    },
})
