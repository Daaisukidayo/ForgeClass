import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"

export default new NativeFunction({
    name: "$classExists",
    version: "1.0.0",
    description: "Checks whether a class exists, returns bool",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("class", "The class name")],
    output: ArgType.Boolean,
    execute(ctx, [name]) {
        return this.success(ctx.client.classes.has(name))
    },
})
