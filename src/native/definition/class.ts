import { Arg, IExtendedCompiledFunctionField, NativeFunction, Return } from "@tryforge/forgescript"
import { ClassDefinition } from "../.."
import { BUILDER } from "../../functions/scope"
import { failureOf } from "../../functions/run"

export default new NativeFunction({
    name: "$class",
    version: "1.0.0",
    description: "Declares a class",
    unwrap: false,
    brackets: true,
    args: [Arg.requiredString("name", "The class name"), Arg.requiredString("body", "The class body")],
    async execute(ctx) {
        const body = this.data.fields![1] as IExtendedCompiledFunctionField

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0)
        if (!this["isValidReturnType"](rt)) return rt
        const [name] = args as [string]

        const outer = ctx[BUILDER]
        if (outer) return this.customError(`${name} can't be declared inside the class ${outer.name}.`)
        if (!name) return this.customError("A class needs a name.")

        const def = new ClassDefinition(name)
        let ran: Return

        ctx[BUILDER] = def
        try {
            ran = await this["resolveCode"](ctx, body)
        } finally {
            ctx[BUILDER] = undefined
        }

        const failure = failureOf(this, ran, `the body of class ${name}`, false)
        if (failure) return failure

        const defined = ctx.client.classes.define(def)
        if (!defined.ok) return this.customError(defined.reason)

        return this.success()
    },
})
