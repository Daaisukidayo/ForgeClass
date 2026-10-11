import { Arg, IExtendedCompiledFunctionField, NativeFunction } from "@tryforge/forgescript"
import { Body, CONSTRUCTOR } from "../.."
import { optionalRest } from "../../functions/args"
import { BUILDER, ParamTypes, PARAMS } from "../../functions/scope"

export default new NativeFunction({
    name: "$constructor",
    version: "1.0.0",
    description: "Declares the class constructor",
    unwrap: false,
    brackets: true,
    args: [Arg.requiredString("code", "The constructor code"), optionalRest("params", "The constructor params")],
    async execute(ctx) {
        const def = ctx[BUILDER]
        if (!def) return this.customError("$constructor can only be used inside $class.")

        const code = this.data.fields![0] as IExtendedCompiledFunctionField

        const types: ParamTypes = new Map()
        let resolved

        ctx[PARAMS] = types
        try {
            resolved = await this["resolveMultipleArgs"](ctx, 1)
        } finally {
            ctx[PARAMS] = undefined
        }

        const { args, return: rt } = resolved
        if (!this["isValidReturnType"](rt)) return rt
        const [params] = args as [string[]]

        const typed = params.map((param) => ({ name: param, ...types.get(param) }))
        const added = def.addMethod(CONSTRUCTOR, typed, new Body(code))
        if (!added.ok) return this.customError(added.reason)

        return this.success()
    },
})
