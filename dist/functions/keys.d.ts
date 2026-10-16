import { Result } from "./result";
/** Names that would reach the prototype. */
export declare const FORBIDDEN_KEYS: ReadonlySet<string>;
/**
 * Fails on an empty name or one that would reach the prototype.
 * @param what For the message, as in "a field name".
 */
export declare function checkName(name: string, what: string): Result<string>;
//# sourceMappingURL=keys.d.ts.map