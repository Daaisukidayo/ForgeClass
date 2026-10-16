import type { ClassDefinition, IInstance } from "../structures";
import type { IParamData } from "../types";
/** The class `$class` is declaring, for the functions in its body. */
export declare const BUILDER: unique symbol;
/** The class code that is running, for access checks. */
export declare const FRAME: unique symbol;
/** Where `$param` puts what it declares. */
export declare const PARAMS: unique symbol;
/** What $param declared, by name, while $method or $constructor reads its params. */
export type ParamTypes = Map<string, Required<Omit<IParamData, "name">>>;
/** The class code that is running. */
export interface IFrame {
    /** Class that declares the method. */
    owner: ClassDefinition;
    /** Null in a static method. */
    instance: IInstance | null;
    /** Null while a field default runs. */
    method: string | null;
}
declare module "@tryforge/forgescript" {
    interface Context {
        [BUILDER]?: ClassDefinition;
        [FRAME]?: IFrame;
        [PARAMS]?: ParamTypes;
    }
}
//# sourceMappingURL=scope.d.ts.map