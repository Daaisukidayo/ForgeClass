import type { ArgType } from "@tryforge/forgescript"
import { Body } from "./Body"
import { CLASS_KEY } from "./Instance"
import { Access, parseDeclaration } from "../functions/declaration"
import { checkName } from "../functions/keys"
import { toParams } from "../functions/params"
import { done, fail, Result } from "../functions/result"
import { IParamData } from "../types"

export const CONSTRUCTOR = "constructor"

export interface IParam {
    name: string
    type: ArgType
    required: boolean
    rest: boolean
}

export interface IField {
    body: Body
    access: Access
    readonly: boolean
}

export interface IMethod {
    params: IParam[]
    body: Body
    access: Access
}

export const isHidden = (name: string) => name.startsWith("#")

/** Own members only, the ClassManager finds inherited ones. */
export class ClassDefinition {
    public parent: string | null = null

    public readonly fields = new Map<string, IField>()

    public readonly methods = new Map<string, IMethod>()

    public readonly hiddenFields = new Map<string, IField>()

    public readonly hiddenMethods = new Map<string, IMethod>()

    public readonly staticFields = new Map<string, IField>()

    public readonly staticMethods = new Map<string, IMethod>()

    /** Values of the static fields, each set on first use. */
    public readonly statics = new Map<string, unknown>()

    public constructor(public readonly name: string) {}

    public describeMethod(method: string) {
        return method === CONSTRUCTOR ? `${this.name}'s constructor` : `${this.name}.${method}`
    }

    public extend(parent: string): Result<void> {
        if (this.parent !== null) return fail(`${this.name} already extends ${this.parent}.`)
        if (!parent) return fail(`${this.name} extends a class with no name.`)
        if (parent === this.name) return fail(`${this.name} can't extend itself.`)

        this.parent = parent
        return done
    }

    /** @param declaration The name, with its modifiers before it. */
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

    /** @param declaration The name, with its modifiers before it. */
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
