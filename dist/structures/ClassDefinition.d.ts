import type { ArgType } from "@tryforge/forgescript";
import { Body } from "./Body";
import { Access } from "../functions/declaration";
import { Result } from "../functions/result";
import { IParamData } from "../types";
/** The constructor's method name. */
export declare const CONSTRUCTOR = "constructor";
/** A param with its defaults filled in. */
export interface IParam {
    name: string;
    type: ArgType;
    required: boolean;
    rest: boolean;
}
/** A declared field. */
export interface IField {
    /** Its default, as code. */
    body: Body;
    access: Access;
    readonly: boolean;
}
/** A declared method. */
export interface IMethod {
    params: IParam[];
    body: Body;
    access: Access;
}
/** Whether it's a `#` name. */
export declare const isHidden: (name: string) => boolean;
/** A declared class. It holds its own members only, the ClassManager finds inherited ones. */
export declare class ClassDefinition {
    readonly name: string;
    /** The class it extends. */
    parent: string | null;
    /** Instance fields, without `#` ones. */
    readonly fields: Map<string, IField>;
    /** Instance methods and the constructor, without `#` ones. */
    readonly methods: Map<string, IMethod>;
    /** `#` fields. */
    readonly hiddenFields: Map<string, IField>;
    /** `#` methods. */
    readonly hiddenMethods: Map<string, IMethod>;
    /** Static fields, `#` ones included. */
    readonly staticFields: Map<string, IField>;
    /** Static methods, `#` ones included. */
    readonly staticMethods: Map<string, IMethod>;
    /** Values of the static fields, each set on first use. */
    readonly statics: Map<string, unknown>;
    constructor(name: string);
    /** `A.m`, or `A's constructor`, for messages. */
    describeMethod(method: string): string;
    /** Sets the parent. Fails when it has one already, or the name is empty or its own. */
    extend(parent: string): Result<void>;
    /**
     * Declares a field. Fails on a bad name or modifiers, or a field declared already.
     * @param declaration The name, with its modifiers before it.
     */
    addField(declaration: string, body: Body): Result<void>;
    /**
     * Declares a method or the constructor. Fails on a bad name, modifiers or params, or a method declared already.
     * @param declaration The name, with its modifiers before it.
     */
    addMethod(declaration: string, params: Array<string | IParamData>, body: Body): Result<void>;
}
//# sourceMappingURL=ClassDefinition.d.ts.map