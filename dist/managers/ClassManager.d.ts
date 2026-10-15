import type { RecursiveArray } from "@tryforge/forgescript";
import { ClassDefinition, ForgeClassBuilder, IField, IInstance, IMethod } from "../structures";
import { Result } from "../functions/result";
import { IClassData } from "../types";
export type ClassInput = IClassData | ForgeClassBuilder;
export interface IFoundMethod extends IMethod {
    name: string;
    owner: ClassDefinition;
}
export interface IFoundField extends IField {
    owner: ClassDefinition;
}
export declare class ClassManager {
    private readonly classes;
    private readonly hidden;
    hiddenOf(instance: IInstance): Map<string, unknown>;
    get(name: string): ClassDefinition | null;
    has(name: string): boolean;
    get names(): string[];
    clear(): void;
    define(...defs: ClassDefinition[]): Result<void>;
    /** `define` for plain objects and builders, throws instead of returning the reason. */
    add(...options: RecursiveArray<ClassInput>[]): void;
    resolve(option: ClassInput): ForgeClassBuilder;
    load(dir: string): void;
    delete(name: string): Result<boolean>;
    childrenOf(name: string): string[];
    /** Stops at the first missing parent. */
    chainOf(def: ClassDefinition): ClassDefinition[];
    findMethod(def: ClassDefinition, name: string): IFoundMethod | null;
    staticMethodOf(def: ClassDefinition, name: string): IFoundMethod | null;
    fieldOf(def: ClassDefinition, name: string): IFoundField | null;
    staticFieldOf(def: ClassDefinition, name: string): IFoundField | null;
    /** Public ones, without the constructor. */
    methodNamesOf(def: ClassDefinition): string[];
    /** Parents' first. */
    fieldsOf(def: ClassDefinition): Map<string, IFoundField>;
    declares(def: ClassDefinition, field: string): boolean;
    private memberOf;
    isA(def: ClassDefinition, ancestor: string): boolean;
    private checkParents;
    private addFrom;
}
//# sourceMappingURL=ClassManager.d.ts.map