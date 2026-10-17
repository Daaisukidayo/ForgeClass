import type { Context } from "@tryforge/forgescript";
import { ClassDefinition } from "../structures";
import { IFoundMethod } from "../managers";
import { Result } from "./result";
/** Where a `#` field is kept in `ClassManager.hiddenOf`. */
export declare const slotOf: (owner: ClassDefinition, name: string) => string;
/** Checks that the running class has the `#` field and the instance is of it. Succeeds with that class. */
export declare function hiddenField(ctx: Context, def: ClassDefinition, name: string): Result<ClassDefinition>;
/** A `#` method of the running class, when the instance is of it. */
export declare function hiddenMethod(ctx: Context, def: ClassDefinition, name: string): Result<IFoundMethod>;
/** Whether the running class has the `#` field and the instance is of it. */
export declare function hasHiddenField(ctx: Context, def: ClassDefinition, name: string): Result<boolean>;
/** Whether the running class has the `#` method and the instance is of it. */
export declare function hasHiddenMethod(ctx: Context, def: ClassDefinition, name: string): Result<boolean>;
//# sourceMappingURL=hidden.d.ts.map