import { CompiledFunction, Context, Return, ReturnType } from "@tryforge/forgescript";
import { Body, ClassDefinition, IInstance } from "../structures";
import { IFoundMethod } from "../managers";
/**
 * Null when the result is a success, or a `$return` that's allowed.
 * A stray `$return`, `$break` or `$continue` becomes an error, anything else passes through.
 */
export declare function failureOf(fn: CompiledFunction, rt: Return, where: string, allowReturn?: boolean): Return | null;
/**
 * Runs a method with `this` and its params in the env, after checking and converting the args.
 * @param instance Null for a static method.
 */
export declare function runMethod(fn: CompiledFunction, ctx: Context, instance: IInstance | null, method: IFoundMethod, args: string[]): Promise<Return<ReturnType>>;
/**
 * Makes an instance: field defaults from the root class down, `#` ones after them, then the constructor.
 * Succeeds with the instance.
 */
export declare function construct(fn: CompiledFunction, ctx: Context, def: ClassDefinition, args: string[]): Promise<Return<ReturnType>>;
/** A static field's value, its default run on first use. */
export declare function staticOf(fn: CompiledFunction, ctx: Context, owner: ClassDefinition, name: string, body: Body): Promise<Return<ReturnType>>;
//# sourceMappingURL=run.d.ts.map