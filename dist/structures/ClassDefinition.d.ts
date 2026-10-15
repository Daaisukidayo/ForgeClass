import type { ArgType } from "@tryforge/forgescript";
import { Body } from "./Body";
import { Access } from "../functions/declaration";
import { Result } from "../functions/result";
import { IParamData } from "../types";
export declare const CONSTRUCTOR = "constructor";
export interface IParam {
    name: string;
    type: ArgType;
    required: boolean;
    rest: boolean;
}
export interface IField {
    body: Body;
    access: Access;
    readonly: boolean;
}
export interface IMethod {
    params: IParam[];
    body: Body;
    access: Access;
}
export declare const isHidden: (name: string) => boolean;
/** Own members only, the ClassManager finds inherited ones. */
export declare class ClassDefinition {
    readonly name: string;
    parent: string | null;
    readonly fields: Map<string, IField>;
    readonly methods: Map<string, IMethod>;
    readonly hiddenFields: Map<string, IField>;
    readonly hiddenMethods: Map<string, IMethod>;
    readonly staticFields: Map<string, IField>;
    readonly staticMethods: Map<string, IMethod>;
    /** Values of the static fields, each set on first use. */
    readonly statics: Map<string, unknown>;
    constructor(name: string);
    describeMethod(method: string): string;
    extend(parent: string): Result<void>;
    /** @param declaration The name, with its modifiers before it. */
    addField(declaration: string, body: Body): Result<void>;
    /** @param declaration The name, with its modifiers before it. */
    addMethod(declaration: string, params: Array<string | IParamData>, body: Body): Result<void>;
}
//# sourceMappingURL=ClassDefinition.d.ts.map