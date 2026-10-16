import { CompiledFunction, Context, Return, ReturnType } from "@tryforge/forgescript";
import type { IParam } from "../structures";
import type { IParamData } from "../types";
import { Result } from "./result";
/** Checks the params and fills in their defaults: `String`, required, not rest. */
export declare function toParams(inputs: Array<string | IParamData>): Result<IParam[]>;
/** How many args a method takes. */
export declare function arityOf(params: IParam[]): {
    min: number;
    max: number;
};
/** One value per param, the rest one as an array. Typed args are converted the way ForgeScript converts its own. */
export declare function valuesOf(fn: CompiledFunction, ctx: Context, params: IParam[], args: string[]): Promise<Return<ReturnType>>;
//# sourceMappingURL=params.d.ts.map