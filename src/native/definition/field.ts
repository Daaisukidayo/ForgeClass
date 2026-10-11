import { Arg, IExtendedCompiledFunctionField, NativeFunction } from "@tryforge/forgescript"
import { Body } from "../.."
import { BUILDER } from "../../functions/scope"

export default new NativeFunction({
    name: "$field",
    version: "1.0.0",
    description: "Declares a class field",
    unwrap: false,
    brackets: true,
    args: [Arg.requiredString("name", "The field name"), Arg.optionalString("default", "The default value")],
    async execute(ctx) {
        const def = ctx[BUILDER]
        if (!def) return this.customError("$field can only be used inside $class.")

        const init = this.data.fields![1] as IExtendedCompiledFunctionField | undefined

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0)
        if (!this["isValidReturnType"](rt)) return rt
        const [name] = args as [string]

        const added = def.addField(name, new Body(init ?? ""))
        if (!added.ok) return this.customError(added.reason)

        return this.success()
    },
})
