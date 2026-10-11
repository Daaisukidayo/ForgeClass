import { Result } from "./result";
export declare function looksLikeJSON(text: string): boolean;
export declare function parseJSON(text: string): Result<unknown>;
/** IDs and other numbers that wouldn't read back the same stay text. */
export declare function parseValue(text: string): unknown;
export declare function parseScalar(text: string): unknown;
export declare function stringify(value: unknown, indent?: number): string;
export declare function toText(value: unknown): string | undefined;
//# sourceMappingURL=value.d.ts.map