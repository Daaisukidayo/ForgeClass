import type { ArgType } from "@tryforge/forgescript";
import type { ParamType } from "./structures";
/** A typed param, as in ForgeScript's own functions. A plain name is an untyped one. */
export interface IParamData {
    /** Read in the code with `$env[name]`. */
    name: string;
    /** A ParamType or its name, `String` by default. */
    type?: Exclude<ArgType, ArgType.Enum> | keyof typeof ParamType;
    /** `true` by default. A required param can't come after an optional one. */
    required?: boolean;
    /** Takes the remaining args as an array. Only the last param can be rest. */
    rest?: boolean;
}
/** A field default in a class file. Every string in it is code, even nested, the rest is kept as it is. */
export type FieldDefault = string | number | boolean | null | FieldDefault[] | {
    [key: string]: FieldDefault;
};
/** A method with params, in a class file. */
export interface IMethodData {
    /** Names or typed params, in order. */
    params?: Array<string | IParamData>;
    /** The ForgeScript code. */
    code: string;
}
/** A class, as a class file exports it. */
export interface IClassData {
    /** The class name. Adding a class with the same name replaces it. */
    name: string;
    /** The parent class. */
    extends?: string;
    /** Defaults by field name. Modifiers go before the name: `"private hp": 100`. */
    fields?: Record<string, FieldDefault>;
    /** Methods by name, as code or with params. Modifiers go before the name, `constructor` is the constructor. */
    methods?: Record<string, string | IMethodData> & {
        /** The constructor, which `$new` runs. */
        constructor?: string | IMethodData | Function;
    };
}
//# sourceMappingURL=types.d.ts.map