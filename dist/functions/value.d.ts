import { Result } from "./result";
/** Whether the text starts like a JSON object or array. */
export declare function looksLikeJSON(text: string): boolean;
/** Parses JSON, keeping integers too long to be exact as text. */
export declare function parseJSON(text: string): Result<unknown>;
/**
 * Text to the value a field keeps: null, JSON, or what `parseScalar` gives.
 * IDs and other numbers that wouldn't read back the same stay text.
 */
export declare function parseValue(text: string): unknown;
/** Text to a boolean or a number that reads back the same, a quoted string without its quotes, or the text. */
export declare function parseScalar(text: string): unknown;
/** `JSON.stringify` that writes bigints as strings. */
export declare function stringify(value: unknown, indent?: number): string;
/** A value as a function's output: text as it is, objects as JSON. */
export declare function toText(value: unknown): string | undefined;
//# sourceMappingURL=value.d.ts.map