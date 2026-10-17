/** The instance field that holds its class name. */
export declare const CLASS_KEY = "__class";
/** An instance: a plain object with its class name and fields, except `#` ones. */
export interface IInstance {
    [CLASS_KEY]: string;
    [field: string]: unknown;
}
/** Whether the value is an instance, of a declared class or not. */
export declare function isInstance(value: unknown): value is IInstance;
/** A copy of the fields, without `__class`. */
export declare function fieldsOf(instance: IInstance): Record<string, unknown>;
//# sourceMappingURL=Instance.d.ts.map