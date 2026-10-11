import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { PARAMS } from "../../functions/scope"

export default new NativeFunction({
    name: "$param",
    version: "1.0.0",
    description: "Declares a typed param, in the params of $method or $constructor",
    unwrap: true,
    brackets: true,
    args: [
        Arg.requiredString("name", "The param name"),
        Arg.requiredEnum(ArgType, "type", "The param type"),
        Arg.optionalBoolean("required", "Whether it must be given, true by default"),
        Arg.optionalBoolean("rest", "Whether it takes all the remaining args, false by default"),
    ],
    output: ArgType.String,
    execute(ctx, [name, type, required, rest]) {
        const params = ctx[PARAMS]
        if (!params) return this.customError("$param can only be used in the params of $method or $constructor.")

        params.set(name, { type, required: required ?? true, rest: rest ?? false })
        return this.success(name)
    },
})
