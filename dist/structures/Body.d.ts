import { IExtendedCompiledFunctionField } from "@tryforge/forgescript";
export type Code = Pick<IExtendedCompiledFunctionField, "resolve" | "functions">;
export declare class Body {
    private readonly source;
    private compiled?;
    constructor(source: Code | string);
    get code(): Code;
}
//# sourceMappingURL=Body.d.ts.map