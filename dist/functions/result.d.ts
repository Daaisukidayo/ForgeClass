export type Result<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    reason: string;
};
export declare const ok: <T>(value: T) => Result<T>;
export declare const fail: (reason: string) => {
    ok: false;
    reason: string;
};
export declare const done: Result<void>;
//# sourceMappingURL=result.d.ts.map