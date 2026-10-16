import type { Context } from "@tryforge/forgescript";
import { ClassDefinition, IInstance } from "../structures";
import { ClassManager } from "../managers";
import { Result } from "./result";
/** An instance with its class. */
export interface IFoundInstance {
    instance: IInstance;
    def: ClassDefinition;
}
/** The instance in a variable, with its class. Fails when there's none or its class isn't declared. */
export declare function instanceIn(ctx: Context, variable: string): Result<IFoundInstance>;
/** The class, or a failure saying it isn't declared. */
export declare function classNamed(classes: ClassManager, name: string): Result<ClassDefinition>;
//# sourceMappingURL=lookup.d.ts.map