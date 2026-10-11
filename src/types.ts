import type { ArgType } from "@tryforge/forgescript"

/** A typed param, as in ForgeScript's own functions. A plain name is an untyped one. */
export interface IParamData {
    name: string
    type?: ArgType | keyof typeof ArgType
    required?: boolean
    rest?: boolean
}

export interface IMethodData {
    params?: Array<string | IParamData>

    code: string
}

export interface IClassData {
    name: string

    extends?: string

    fields?: Record<string, string | number | boolean>

    methods?: Record<string, string | IMethodData>
}
