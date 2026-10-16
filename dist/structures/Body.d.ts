import { IExtendedCompiledFunctionField } from "@tryforge/forgescript";
import type { FieldDefault } from "../types";
/** Compiled ForgeScript code. */
export type Code = Pick<IExtendedCompiledFunctionField, "resolve" | "functions">;
/** The code of a field default or method, compiled on first use. */
export declare class Body {
    private readonly source;
    private compiled?;
    /** @param source Compiled code, text from a class file, or what compiles it. */
    constructor(source: Code | string | (() => Code));
    /** A field default from a class file. Its strings are code wherever they are, the rest is kept as it is. */
    static of(value: FieldDefault): Body;
    /** The compiled code. Throws when the text doesn't compile. */
    get code(): Code;
}
//# sourceMappingURL=Body.d.ts.map