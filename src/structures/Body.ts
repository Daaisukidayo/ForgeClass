import { Compiler, IExtendedCompiledFunctionField } from "@tryforge/forgescript"
import { parseValue, stringify } from "../functions/value"
import type { FieldDefault } from "../types"

/** Compiled ForgeScript code. */
export type Code = Pick<IExtendedCompiledFunctionField, "resolve" | "functions">

/** The code of a field default or method, compiled on first use. */
export class Body {
    private compiled?: Code

    /** @param source Compiled code, text from a class file, or what compiles it. */
    public constructor(private readonly source: Code | string | (() => Code)) {}

    /** A field default from a class file. Its strings are code wherever they are, the rest is kept as it is. */
    public static of(value: FieldDefault) {
        return new Body(typeof value === "string" ? value : () => compileValue(value))
    }

    /** The compiled code. Throws when the text doesn't compile. */
    public get code(): Code {
        if (typeof this.source === "object") return this.source
        return (this.compiled ??= typeof this.source === "string" ? Compiler.compile(this.source) : this.source())
    }
}

/** One piece of code for every string in the value. It gives the value as JSON, each string replaced by its output. */
function compileValue(value: FieldDefault): Code {
    const parts: Code[] = []
    const build = planOf(value, parts)

    return {
        functions: parts.flatMap((part) => part.functions),
        resolve: (args) => {
            let at = 0

            const outputs = parts.map((part) => {
                const own = args.slice(at, at + part.functions.length)
                at += part.functions.length

                return part.resolve(own)
            })

            return stringify(build(outputs))
        },
    }
}

/** What builds the value from the outputs of its strings, each compiled into `parts`. */
function planOf(value: FieldDefault, parts: Code[]): (outputs: string[]) => unknown {
    if (typeof value === "string") {
        const at = parts.push(Compiler.compile(value)) - 1
        return (outputs) => parseValue(outputs[at])
    }

    if (Array.isArray(value)) {
        const items = value.map((item) => planOf(item, parts))
        return (outputs) => items.map((item) => item(outputs))
    }

    if (value !== null && typeof value === "object") {
        const entries = Object.entries(value).map(([key, item]) => [key, planOf(item, parts)] as const)
        return (outputs) => Object.fromEntries(entries.map(([key, item]) => [key, item(outputs)]))
    }

    return () => value
}
