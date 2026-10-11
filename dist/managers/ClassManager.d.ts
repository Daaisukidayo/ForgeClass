import { Body, ClassDefinition, IInstance, IMethod } from "../structures";
import { Result } from "../functions/result";
import { IClassData } from "../types";
export interface IFoundMethod extends IMethod {
    name: string;
    owner: ClassDefinition;
}
export interface IFoundField {
    owner: ClassDefinition;
    body: Body;
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
    /** `define` for plain objects, throws instead of returning the reason. */
    add(...data: Array<IClassData | IClassData[]>): void;
    load(dir: string): void;
    delete(name: string): Result<boolean>;
    childrenOf(name: string): string[];
    /** Stops at the first missing parent. */
    chainOf(def: ClassDefinition): ClassDefinition[];
    findMethod(def: ClassDefinition, name: string): IFoundMethod | null;
    methodNamesOf(def: ClassDefinition): string[];
    /** Parents' first. */
    fieldsOf(def: ClassDefinition): Map<string, IFoundField>;
    declares(def: ClassDefinition, field: string): boolean;
    isA(def: ClassDefinition, ancestor: string): boolean;
    private checkParents;
    private addFrom;
}
//# sourceMappingURL=ClassManager.d.ts.map