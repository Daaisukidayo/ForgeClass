import type { ClassDefinition, IInstance, IParam } from "../structures"

export const BUILDER = Symbol("ForgeClass.builder")

export const FRAME = Symbol("ForgeClass.frame")

export const PARAMS = Symbol("ForgeClass.params")

/** What $param declared, by name, while $method or $constructor reads its params. */
export type ParamTypes = Map<string, Omit<IParam, "name">>

export interface IFrame {
    /** Class that declares the method. */
    owner: ClassDefinition
    instance: IInstance
}

declare module "@tryforge/forgescript" {
    interface Context {
        [BUILDER]?: ClassDefinition
        [FRAME]?: IFrame
        [PARAMS]?: ParamTypes
    }
}
