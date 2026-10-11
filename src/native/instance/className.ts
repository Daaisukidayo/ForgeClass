import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { CLASS_KEY, isInstance } from "../.."

export default new NativeFunction({
    name: "$className",
    version: "1.0.0",
    description: "Returns the class name of an instance",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("variable", "The instance variable")],
    output: ArgType.String,
    execute(ctx, [variable]) {
        const value = ctx.getEnvironmentKey(variable)
        if (!isInstance(value)) return this.customError(`"${variable}" does not hold a class instance.`)

        return this.success(value[CLASS_KEY])
    },
})
