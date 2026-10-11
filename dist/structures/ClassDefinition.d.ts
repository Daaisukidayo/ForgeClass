import type { ArgType } from "@tryforge/forgescript";
import { Body } from "./Body";
import { Result } from "../functions/result";
import { IParamData } from "../types";
export declare const CONSTRUCTOR = "constructor";
export interface IParam {
    name: string;
    type: ArgType;
    required: boolean;
    rest: boolean;
}
export interface IMethod {
    params: IParam[];
    body: Body;
}
export declare const isHidden: (name: string) => boolean;
/** Own members only, the ClassManager finds inherited ones. */
export declare class ClassDefinition {
    readonly name: string;
    parent: string | null;
    readonly fields: Map<string, Body>;
    readonly methods: Map<string, IMethod>;
    readonly hiddenFields: Map<string, Body>;
    readonly hiddenMethods: Map<string, IMethod>;
    constructor(name: string);
    describeMethod(method: string): string;
    extend(parent: string): Result<void>;
    addField(name: string, body: Body): Result<void>;
    addMethod(name: string, params: Array<string | IParamData>, body: Body): Result<void>;
    private checkHidden;
}
//# sourceMappingURL=ClassDefinition.d.ts.map