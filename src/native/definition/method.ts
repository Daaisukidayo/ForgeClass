import { Arg, IExtendedCompiledFunctionField, NativeFunction } from "@tryforge/forgescript"
import { Body, CONSTRUCTOR } from "../.."
import { optionalRest } from "../../functions/args"
import { BUILDER, ParamTypes, PARAMS } from "../../functions/scope"

export default new NativeFunction({
    name: "$method",
    version: "1.0.0",
    description: "Declares a class method",
    unwrap: false,
    brackets: true,
    args: [
        Arg.requiredString("name", "The method name"),
        Arg.requiredString("code", "The method code"),
        optionalRest("params", "The method params"),
    ],
    async execute(ctx) {
        const def = ctx[BUILDER]
        if (!def) return this.customError("$method can only be used inside $class.")

        const code = this.data.fields![1] as IExtendedCompiledFunctionField

        const types: ParamTypes = new Map()
        let resolved

        ctx[PARAMS] = types
        try {
            resolved = await this["resolveMultipleArgs"](ctx, 0, 2)
        } finally {
            ctx[PARAMS] = undefined
        }

        const { args, return: rt } = resolved
        if (!this["isValidReturnType"](rt)) return rt
        const [name, params] = args as [string, string[]]

        if (name === CONSTRUCTOR) return this.customError("The constructor is declared with $constructor.")

        const typed = params.map((param) => ({ name: param, ...types.get(param) }))
        const added = def.addMethod(name, typed, new Body(code))
        if (!added.ok) return this.customError(added.reason)

        return this.success()
    },
})
