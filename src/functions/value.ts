import { fail, ok, Result } from "./result"

const JSON_START = /^\s*[[{]/

const LONG_DIGITS = /\d{16,}/

const INTEGER = /^-?\d+$/

/** Whether the text starts like a JSON object or array. */
export function looksLikeJSON(text: string) {
    return JSON_START.test(text)
}

/** Parses JSON, keeping integers too long to be exact as text. */
export function parseJSON(text: string): Result<unknown> {
    try {
        const value: unknown = JSON.parse(text)
        return ok(LONG_DIGITS.test(text) && hasUnsafeInteger(value) ? JSON.parse(text, keepLongIntegers) : value)
    } catch (err) {
        return fail(err instanceof Error ? err.message : String(err))
    }
}

/** Whether there's an integer too big to be exact, at any depth. */
function hasUnsafeInteger(value: unknown): boolean {
    if (typeof value === "number") return Number.isInteger(value) && !Number.isSafeInteger(value)

    return typeof value === "object" && value !== null && Object.values(value).some(hasUnsafeInteger)
}

/** A `JSON.parse` reviver that turns inexact integers back into their text. */
function keepLongIntegers(_key: string, value: unknown, context?: { source?: string }) {
    if (typeof value === "number" && !Number.isSafeInteger(value) && context?.source && INTEGER.test(context.source)) {
        return context.source
    }

    return value
}

/**
 * Text to the value a field keeps: null, JSON, or what `parseScalar` gives.
 * IDs and other numbers that wouldn't read back the same stay text.
 */
export function parseValue(text: string): unknown {
    if (text === "null") return null

    if (looksLikeJSON(text)) {
        const parsed = parseJSON(text)
        if (parsed.ok) return parsed.value
    }

    return parseScalar(text)
}

/** Text to a boolean or a number that reads back the same, a quoted string without its quotes, or the text. */
export function parseScalar(text: string): unknown {
    if (text.length > 1 && text.startsWith('"') && text.endsWith('"')) {
        const parsed = parseJSON(text)
        return parsed.ok && typeof parsed.value === "string" ? parsed.value : text.slice(1, -1)
    }

    if (text === "true") return true
    if (text === "false") return false

    const number = Number(text)
    if (Number.isFinite(number) && String(number) === text) return number

    return text
}

/** `JSON.stringify` that writes bigints as strings. */
export function stringify(value: unknown, indent?: number): string {
    return JSON.stringify(value, (_key, item) => (typeof item === "bigint" ? item.toString() : item), indent)
}

/** A value as a function's output: text as it is, objects as JSON. */
export function toText(value: unknown): string | undefined {
    if (value === undefined) return undefined
    if (typeof value === "string") return value
    if (typeof value === "object") return stringify(value)

    return String(value)
}
