import { Result } from "./result";
export type Access = "public" | "protected" | "private";
export interface IDeclaration {
    name: string;
    access: Access;
    static: boolean;
    readonly: boolean;
}
/** Splits `private readonly hp` into the name and its modifiers. */
export declare function parseDeclaration(text: string, kind: "field" | "method"): Result<IDeclaration>;
//# sourceMappingURL=declaration.d.ts.map