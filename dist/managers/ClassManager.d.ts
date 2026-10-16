import type { RecursiveArray } from "@tryforge/forgescript";
import { ClassDefinition, ForgeClassBuilder, IField, IInstance, IMethod } from "../structures";
import { Result } from "../functions/result";
import { IClassData } from "../types";
/** What `add()` takes. */
export type ClassInput = IClassData | ForgeClassBuilder;
/** A method found up the chain, with the class that declares it as `owner`. */
export interface IFoundMethod extends IMethod {
    name: string;
    owner: ClassDefinition;
}
/** A field found up the chain, with the class that declares it as `owner`. */
export interface IFoundField extends IField {
    owner: ClassDefinition;
}
/** The classes of a client, at `client.classes`. */
export declare class ClassManager {
    private readonly classes;
    private readonly hidden;
    /** The `#` field values of an instance, keyed by `slotOf`. Made on first use. */
    hiddenOf(instance: IInstance): Map<string, unknown>;
    /** The class, or null. */
    get(name: string): ClassDefinition | null;
    /** Whether the class is declared. */
    has(name: string): boolean;
    /** The names of every class. */
    get names(): string[];
    /** Deletes every class. */
    clear(): void;
    /**
     * Adds or replaces classes, all or none. Parents may come in any order.
     * Fails on a missing or repeated name, a missing parent, or a circle.
     */
    define(...defs: ClassDefinition[]): Result<void>;
    /** `define` for plain objects and builders, throws instead of returning the reason. */
    add(...options: RecursiveArray<ClassInput>[]): void;
    /** Wraps a plain object in a builder. */
    resolve(option: ClassInput): ForgeClassBuilder;
    /**
     * Adds the classes every `.js` file in the folder exports, subfolders included.
     * Throws like `add()`, naming the file.
     * @param dir Relative to the working directory.
     */
    load(dir: string): void;
    /** Deletes a class unless another one extends it. Succeeds with whether it existed. */
    delete(name: string): Result<boolean>;
    /** The classes that extend it directly. */
    childrenOf(name: string): string[];
    /** The class and its parents, nearest first. Stops at a missing parent. */
    chainOf(def: ClassDefinition): ClassDefinition[];
    /** An instance method or the constructor, inherited ones included, `#` ones not. */
    findMethod(def: ClassDefinition, name: string): IFoundMethod | null;
    /** A static method, inherited ones included. */
    staticMethodOf(def: ClassDefinition, name: string): IFoundMethod | null;
    /** An instance field, inherited ones included, `#` ones not. */
    fieldOf(def: ClassDefinition, name: string): IFoundField | null;
    /** A static field, inherited ones included. */
    staticFieldOf(def: ClassDefinition, name: string): IFoundField | null;
    /** Public method names, inherited ones included, without the constructor. */
    methodNamesOf(def: ClassDefinition): string[];
    /** Instance fields with the class that declares each, parents' first. A redeclared field keeps its place. */
    fieldsOf(def: ClassDefinition): Map<string, IFoundField>;
    /** Whether the class or a parent declares the field. */
    declares(def: ClassDefinition, field: string): boolean;
    /** The member from the first class up the chain that has it. */
    private memberOf;
    /** Whether the class is `ancestor` or extends it. */
    isA(def: ClassDefinition, ancestor: string): boolean;
    /** Fails when a parent is missing or the classes extend each other in a circle. */
    private checkParents;
    /** Makes classes from the data and defines them, throwing on the first problem. */
    private addFrom;
}
//# sourceMappingURL=ClassManager.d.ts.map