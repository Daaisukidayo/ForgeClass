import type { ArgType } from "@tryforge/forgescript"
import { Body } from "./Body"
import { CLASS_KEY } from "./Instance"
import { Access, parseDeclaration } from "../functions/declaration"
import { checkName } from "../functions/keys"
import { toParams } from "../functions/params"
import { done, fail, Result } from "../functions/result"
import { IParamData } from "../types"

/** The constructor's method name. */
export const CONSTRUCTOR = "constructor"

/** A param with its defaults filled in. */
export interface IParam {
    name: string
    type: ArgType
    required: boolean
    rest: boolean
}

/** A declared field. */
export interface IField {
    /** Its default, as code. */
    body: Body
    access: Access
    readonly: boolean
}

/** A declared method. */
export interface IMethod {
    params: IParam[]
    body: Body
    access: Access
}

/** Whether it's a `#` name. */
export const isHidden = (name: string) => name.startsWith("#")

/** A declared class. It holds its own members only, the ClassManager finds inherited ones. */
export class ClassDefinition {
    /** The class it extends. */
    public parent: string | null = null

    /** Instance fields, without `#` ones. */
    public readonly fields = new Map<string, IField>()

    /** Instance methods and the constructor, without `#` ones. */
    public readonly methods = new Map<string, IMethod>()

    /** `#` fields. */
    public readonly hiddenFields = new Map<string, IField>()

    /** `#` methods. */
    public readonly hiddenMethods = new Map<string, IMethod>()

    /** Static fields, `#` ones included. */
    public readonly staticFields = new Map<string, IField>()

    /** Static methods, `#` ones included. */
    public readonly staticMethods = new Map<string, IMethod>()

    /** Values of the static fields, each set on first use. */
    public readonly statics = new Map<string, unknown>()

    public constructor(public readonly name: string) {}

    /** `A.m`, or `A's constructor`, for messages. */
    public describeMethod(method: string) {
        return method === CONSTRUCTOR ? `${this.name}'s constructor` : `${this.name}.${method}`
    }

    /** Sets the parent. Fails when it has one already, or the name is empty or its own. */
    public extend(parent: string): Result<void> {
        if (this.parent !== null) return fail(`${this.name} already extends ${this.parent}.`)
        if (!parent) return fail(`${this.name} extends a class with no name.`)
        if (parent === this.name) return fail(`${this.name} can't extend itself.`)

        this.parent = parent
        return done
    }

    /**
     * Declares a field. Fails on a bad name or modifiers, or a field declared already.
     * @param declaration The name, with its modifiers before it.
     */
    public addField(declaration: string, body: Body): Result<void> {
        const parsed = parseDeclaration(declaration, "field")
        if (!parsed.ok) return fail(`${this.name}: ${parsed.reason}`)
        const { name, access, readonly } = parsed.value

        if (!isHidden(name)) {
            if (name === CLASS_KEY) return fail(`"${CLASS_KEY}" holds the class name and can't be a field.`)

            const checked = checkName(name, "a field name")
            if (!checked.ok) return checked
        }

        const fields = parsed.value.static ? this.staticFields : isHidden(name) ? this.hiddenFields : this.fields
        if (fields.has(name)) return fail(`${this.name}.${name} is declared twice.`)

        fields.set(name, { body, access, readonly })
        return done
    }

    /**
     * Declares a method or the constructor. Fails on a bad name, modifiers or params, or a method declared already.
     * @param declaration The name, with its modifiers before it.
     */
    public addMethod(declaration: string, params: Array<string | IParamData>, body: Body): Result<void> {
        const parsed = parseDeclaration(declaration, "method")
        if (!parsed.ok) return fail(`${this.name}: ${parsed.reason}`)
        const { name, access } = parsed.value

        const label = this.describeMethod(name)
        const methods = parsed.value.static ? this.staticMethods : isHidden(name) ? this.hiddenMethods : this.methods
        if (methods.has(name)) return fail(`${label} is declared twice.`)

        const read = toParams(params)
        if (!read.ok) return fail(`${label}: ${read.reason}`)

        const names = read.value.map((param) => param.name)

        for (const [i, param] of names.entries()) {
            const checked = checkName(param, "a parameter name")
            if (!checked.ok) return fail(`${label}: ${checked.reason}`)

            if (param === "this") return fail(`${label}: "this" is the instance and can't be a parameter.`)
            if (names.indexOf(param) !== i) return fail(`${label} has two parameters named "${param}".`)
        }

        methods.set(name, { params: read.value, body, access })
        return done
    }
}
