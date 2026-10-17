import { fail, ok, Result } from "./result"

/** Names that would reach the prototype. */
export const FORBIDDEN_KEYS: ReadonlySet<string> = new Set(["__proto__", "prototype", "constructor"])

/**
 * Fails on an empty name or one that would reach the prototype.
 * @param what For the message, as in "a field name".
 */
export function checkName(name: string, what: string): Result<string> {
    if (!name) return fail(`${what[0].toUpperCase()}${what.slice(1)} can't be empty.`)
    if (FORBIDDEN_KEYS.has(name)) return fail(`"${name}" can't be ${what}, it leads to the prototype.`)

    return ok(name)
}
