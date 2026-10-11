import { CompiledFunction, Context, Return, ReturnType } from "@tryforge/forgescript";
import { ClassDefinition, IInstance } from "../structures";
import { IFoundMethod } from "../managers";
export declare function failureOf(fn: CompiledFunction, rt: Return, where: string, allowReturn?: boolean): Return | null;
export declare function runMethod(fn: CompiledFunction, ctx: Context, instance: IInstance, method: IFoundMethod, args: string[]): Promise<Return<ReturnType>>;
/** Field defaults from the root class down, then the constructor. Succeeds with the instance. */
export declare function construct(fn: CompiledFunction, ctx: Context, def: ClassDefinition, args: string[]): Promise<Return<ReturnType>>;
//# sourceMappingURL=run.d.ts.map