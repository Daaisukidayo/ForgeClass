import { Compiler, IExtendedCompiledFunctionField } from "@tryforge/forgescript"

export type Code = Pick<IExtendedCompiledFunctionField, "resolve" | "functions">

export class Body {
    private compiled?: Code

    public constructor(private readonly source: Code | string) {}

    public get code(): Code {
        if (typeof this.source !== "string") return this.source
        return (this.compiled ??= Compiler.compile(this.source))
    }
}
