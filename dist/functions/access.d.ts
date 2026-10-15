import type { Context } from "@tryforge/forgescript";
import { ClassDefinition, IInstance } from "../structures";
import type { Access } from "./declaration";
/** Private reaches from the declaring class only, protected from it and its children too. */
export declare function canReach(ctx: Context, owner: ClassDefinition, access: Access): boolean;
export declare const unreachable: (owner: ClassDefinition, name: string, access: Access) => string;
/** Readonly fields are set by their defaults, or in the constructor of the same instance. */
export declare function canWrite(ctx: Context, instance: IInstance): boolean;
//# sourceMappingURL=access.d.ts.map