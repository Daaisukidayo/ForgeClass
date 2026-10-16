import type { ClassDefinition, IInstance } from "../structures"
import type { IParamData } from "../types"

/** The class `$class` is declaring, for the functions in its body. */
export const BUILDER = Symbol("ForgeClass.builder")

/** The class code that is running, for access checks. */
export const FRAME = Symbol("ForgeClass.frame")

/** Where `$param` puts what it declares. */
export const PARAMS = Symbol("ForgeClass.params")

/** What $param declared, by name, while $method or $constructor reads its params. */
export type ParamTypes = Map<string, Required<Omit<IParamData, "name">>>

/** The class code that is running. */
export interface IFrame {
    /** Class that declares the method. */
    owner: ClassDefinition
    /** Null in a static method. */
    instance: IInstance | null
    /** Null while a field default runs. */
    method: string | null
}

declare module "@tryforge/forgescript" {
    interface Context {
        [BUILDER]?: ClassDefinition
        [FRAME]?: IFrame
        [PARAMS]?: ParamTypes
    }
}
