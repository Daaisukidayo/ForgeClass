import { CompiledFunction, Context, Return, ReturnType } from "@tryforge/forgescript";
import { Body, ClassDefinition, IInstance } from "../structures";
import { IFoundMethod } from "../managers";
export declare function failureOf(fn: CompiledFunction, rt: Return, where: string, allowReturn?: boolean): Return | null;
export declare function runMethod(fn: CompiledFunction, ctx: Context, instance: IInstance | null, method: IFoundMethod, args: string[]): Promise<Return<ReturnType>>;
/** Field defaults from the root class down, then the constructor. Succeeds with the instance. */
export declare function construct(fn: CompiledFunction, ctx: Context, def: ClassDefinition, args: string[]): Promise<Return<ReturnType>>;
/** A static field's value, its default run on first use. */
export declare function staticOf(fn: CompiledFunction, ctx: Context, owner: ClassDefinition, name: string, body: Body): Promise<Return<ReturnType>>;
//# sourceMappingURL=run.d.ts.map