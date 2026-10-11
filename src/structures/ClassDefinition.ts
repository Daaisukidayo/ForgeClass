import type { ArgType } from "@tryforge/forgescript"
import { Body } from "./Body"
import { CLASS_KEY } from "./Instance"
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

export interface IMethod {
    params: IParam[]
    body: Body
}

export const isHidden = (name: string) => name.startsWith("#")

/** Own members only, the ClassManager finds inherited ones. */
export class ClassDefinition {
    public parent: string | null = null

    public readonly fields = new Map<string, Body>()

    public readonly methods = new Map<string, IMethod>()

    public readonly hiddenFields = new Map<string, Body>()

    public readonly hiddenMethods = new Map<string, IMethod>()

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

    public addField(name: string, body: Body): Result<void> {
        if (isHidden(name)) {
            const checked = this.checkHidden(name)
            if (!checked.ok) return checked
        } else {
            if (name === CLASS_KEY) return fail(`"${CLASS_KEY}" holds the class name and can't be a field.`)

            const checked = checkName(name, "a field name")
            if (!checked.ok) return checked
        }

        const fields = isHidden(name) ? this.hiddenFields : this.fields
        if (fields.has(name)) return fail(`${this.name}.${name} is declared twice.`)

        fields.set(name, body)
        return done
    }

    public addMethod(name: string, params: Array<string | IParamData>, body: Body): Result<void> {
        if (!name) return fail(`A method of ${this.name} has no name.`)

        if (isHidden(name)) {
            const checked = this.checkHidden(name)
            if (!checked.ok) return checked
        }

        const label = this.describeMethod(name)
        const methods = isHidden(name) ? this.hiddenMethods : this.methods
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

        methods.set(name, { params: read.value, body })
        return done
    }

    private checkHidden(name: string): Result<void> {
        if (name === "#") return fail(`${this.name}: a # needs a name after it.`)
        if (name === "#constructor") return fail(`${this.name}: "#constructor" can't be a name.`)

        return done
    }
}
