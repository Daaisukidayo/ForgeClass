export type Result<T> = { ok: true; value: T } | { ok: false; reason: string }

export const ok = <T>(value: T): Result<T> => ({ ok: true, value })

export const fail = (reason: string): { ok: false; reason: string } => ({ ok: false, reason })

export const done: Result<void> = ok(undefined)
