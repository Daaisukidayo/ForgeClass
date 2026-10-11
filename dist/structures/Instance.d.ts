export declare const CLASS_KEY = "__class";
export interface IInstance {
    [CLASS_KEY]: string;
    [field: string]: unknown;
}
export declare function isInstance(value: unknown): value is IInstance;
export declare function fieldsOf(instance: IInstance): Record<string, unknown>;
//# sourceMappingURL=Instance.d.ts.map