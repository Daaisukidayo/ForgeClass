import type { ClassDefinition, IInstance, IParam } from "../structures";
export declare const BUILDER: unique symbol;
export declare const FRAME: unique symbol;
export declare const PARAMS: unique symbol;
/** What $param declared, by name, while $method or $constructor reads its params. */
export type ParamTypes = Map<string, Omit<IParam, "name">>;
export interface IFrame {
    /** Class that declares the method. */
    owner: ClassDefinition;
    instance: IInstance;
}
declare module "@tryforge/forgescript" {
    interface Context {
        [BUILDER]?: ClassDefinition;
        [FRAME]?: IFrame;
        [PARAMS]?: ParamTypes;
    }
}
//# sourceMappingURL=scope.d.ts.map