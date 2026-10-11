import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { CLASS_KEY, isInstance } from "../.."

export default new NativeFunction({
    name: "$instanceOf",
    version: "1.0.0",
    description: "Checks whether a variable holds an instance of a class, returns bool",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("variable", "The variable to check"), Arg.requiredString("class", "The class name")],
    output: ArgType.Boolean,
    execute(ctx, [variable, name]) {
        const value = ctx.getEnvironmentKey(variable)
        if (!isInstance(value)) return this.success(false)

        const classes = ctx.client.classes
        const def = classes.get(value[CLASS_KEY])

        return this.success(def !== null && classes.isA(def, name))
    },
})
