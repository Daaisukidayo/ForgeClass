import { Arg, ArgType, NativeFunction } from "@tryforge/forgescript"
import { fieldsOf } from "../.."
import { instanceIn } from "../../functions/lookup"
import { stringify } from "../../functions/value"

export default new NativeFunction({
    name: "$instanceFields",
    version: "1.0.0",
    description: "Returns the fields of an instance as JSON",
    unwrap: true,
    brackets: true,
    args: [Arg.requiredString("variable", "The instance variable")],
    output: ArgType.Json,
    execute(ctx, [variable]) {
        const found = instanceIn(ctx, variable)
        if (!found.ok) return this.customError(found.reason)

        return this.success(stringify(fieldsOf(found.value.instance)))
    },
})
