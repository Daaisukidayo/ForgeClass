import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { isInstance } from "../.."

export default new NativeFunction({
    name: "$isInstance",
    version: "1.0.0",
    description: "Checks whether a variable holds an instance, returns bool",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("variable", "The variable to check")],
    output: ArgType.Boolean,
    execute(ctx, [variable]) {
        return this.success(isInstance(ctx.getEnvironmentKey(variable)))
    },
})
