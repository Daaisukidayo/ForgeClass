import { Result } from "./result";
/** Where a member can be reached from. */
export type Access = "public" | "protected" | "private";
/** A member name with its modifiers. */
export interface IDeclaration {
    name: string;
    access: Access;
    static: boolean;
    readonly: boolean;
}
/** Splits `private readonly hp` into the name and its modifiers. Fails on unknown, repeated or clashing ones. */
export declare function parseDeclaration(text: string, kind: "field" | "method"): Result<IDeclaration>;
//# sourceMappingURL=declaration.d.ts.map