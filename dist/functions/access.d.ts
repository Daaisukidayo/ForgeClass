import type { Context } from "@tryforge/forgescript";
import { ClassDefinition, IInstance } from "../structures";
import type { Access } from "./declaration";
/** Whether the running code reaches the member: private from its class only, protected from its children too. */
export declare function canReach(ctx: Context, owner: ClassDefinition, access: Access): boolean;
/** The error for a member out of reach. */
export declare const unreachable: (owner: ClassDefinition, name: string, access: Access) => string;
/** Whether readonly fields of the instance can be set here. Only its constructor can, besides the defaults. */
export declare function canWrite(ctx: Context, instance: IInstance): boolean;
//# sourceMappingURL=access.d.ts.map