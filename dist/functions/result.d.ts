/** A value, or why there's none. */
export type Result<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    reason: string;
};
/** A success with a value. */
export declare const ok: <T>(value: T) => Result<T>;
/** A failure with its reason. */
export declare const fail: (reason: string) => {
    ok: false;
    reason: string;
};
/** A success with no value. */
export declare const done: Result<void>;
//# sourceMappingURL=result.d.ts.map