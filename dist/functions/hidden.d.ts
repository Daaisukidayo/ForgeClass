import type { Context } from "@tryforge/forgescript";
import { ClassDefinition } from "../structures";
import { IFoundMethod } from "../managers";
import { Result } from "./result";
export declare const slotOf: (owner: ClassDefinition, name: string) => string;
/** Returns the class that declares it. */
export declare function hiddenField(ctx: Context, def: ClassDefinition, name: string): Result<ClassDefinition>;
export declare function hiddenMethod(ctx: Context, def: ClassDefinition, name: string): Result<IFoundMethod>;
export declare function hasHiddenField(ctx: Context, def: ClassDefinition, name: string): Result<boolean>;
//# sourceMappingURL=hidden.d.ts.map