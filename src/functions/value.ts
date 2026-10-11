import { fail, ok, Result } from "./result"

const JSON_START = /^\s*[[{]/

const LONG_DIGITS = /\d{16,}/

const INTEGER = /^-?\d+$/

export function looksLikeJSON(text: string) {
    return JSON_START.test(text)
}

export function parseJSON(text: string): Result<unknown> {
    try {
        const value: unknown = JSON.parse(text)
        return ok(LONG_DIGITS.test(text) && hasUnsafeInteger(value) ? JSON.parse(text, keepLongIntegers) : value)
    } catch (err) {
        return fail(err instanceof Error ? err.message : String(err))
    }
}

function hasUnsafeInteger(value: unknown): boolean {
    if (typeof value === "number") return Number.isInteger(value) && !Number.isSafeInteger(value)

    return typeof value === "object" && value !== null && Object.values(value).some(hasUnsafeInteger)
}

function keepLongIntegers(_key: string, value: unknown, context?: { source?: string }) {
    if (typeof value === "number" && !Number.isSafeInteger(value) && context?.source && INTEGER.test(context.source)) {
        return context.source
    }

    return value
}

/** IDs and other numbers that wouldn't read back the same stay text. */
export function parseValue(text: string): unknown {
    if (text === "null") return null

    if (looksLikeJSON(text)) {
        const parsed = parseJSON(text)
        if (parsed.ok) return parsed.value
    }

    return parseScalar(text)
}

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

export function stringify(value: unknown, indent?: number): string {
    return JSON.stringify(value, (_key, item) => (typeof item === "bigint" ? item.toString() : item), indent)
}

export function toText(value: unknown): string | undefined {
    if (value === undefined) return undefined
    if (typeof value === "string") return value
    if (typeof value === "object") return stringify(value)

    return String(value)
}
