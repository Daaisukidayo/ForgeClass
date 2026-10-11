import type { Context } from "@tryforge/forgescript";
import { ClassDefinition, IInstance } from "../structures";
import { ClassManager } from "../managers";
import { Result } from "./result";
export interface IFoundInstance {
    instance: IInstance;
    def: ClassDefinition;
}
export declare function instanceIn(ctx: Context, variable: string): Result<IFoundInstance>;
export declare function classNamed(classes: ClassManager, name: string): Result<ClassDefinition>;
//# sourceMappingURL=lookup.d.ts.map