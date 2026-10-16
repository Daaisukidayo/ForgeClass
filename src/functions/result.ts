/** A value, or why there's none. */
export type Result<T> = { ok: true; value: T } | { ok: false; reason: string }

/** A success with a value. */
export const ok = <T>(value: T): Result<T> => ({ ok: true, value })

/** A failure with its reason. */
export const fail = (reason: string): { ok: false; reason: string } => ({ ok: false, reason })

/** A success with no value. */
export const done: Result<void> = ok(undefined)
