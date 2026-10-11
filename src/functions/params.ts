import { ArgType, CompiledFunction, Context, IArg, Return, ReturnType } from "@tryforge/forgescript"
import type { IParam } from "../structures"
import type { IParamData } from "../types"
import { fail, ok, Result } from "./result"

export function toParams(inputs: Array<string | IParamData>): Result<IParam[]> {
    const params: IParam[] = []

    for (const [i, input] of inputs.entries()) {
        const data: IParamData = typeof input === "string" ? { name: input } : input
        if (typeof data?.name !== "string") return fail("A param has no name.")

        const type = typeOf(data.type)
        if (type === null) return fail(`"${data.type}" is not a type, in param ${data.name}.`)
        if (type === ArgType.Enum) return fail(`Param ${data.name} can't be an Enum, it has no values to pick from.`)

        const param = { name: data.name, type, required: data.required ?? true, rest: data.rest ?? false }

        if (param.rest && i !== inputs.length - 1) return fail(`Only the last param can be rest, not ${param.name}.`)
        if (param.required && params.some((before) => !before.required)) {
            return fail(`The required param ${param.name} can't come after an optional one.`)
        }

        params.push(param)
    }

    return ok(params)
}

function typeOf(type: IParamData["type"]): ArgType | null {
    if (type === undefined) return ArgType.String
    if (typeof type === "number") return ArgType[type] === undefined ? null : type

    const value = Object.hasOwn(ArgType, type) ? (ArgType as unknown as Record<string, unknown>)[type] : undefined
    return typeof value === "number" ? value : null
}

/** How many args a method takes. */
export function arityOf(params: IParam[]) {
    return {
        min: params.filter((param) => param.required).length,
        max: params.at(-1)?.rest ? Infinity : params.length,
    }
}

/** One value per param, the rest one as an array. Typed args are converted the way ForgeScript converts its own. */
export async function valuesOf(fn: CompiledFunction, ctx: Context, params: IParam[], args: string[]) {
    const values: unknown[] = []

    for (const [i, param] of params.entries()) {
        if (param.rest) {
            const rest: unknown[] = []

            for (const text of args.slice(i)) {
                const rt = await valueOf(fn, ctx, param, text)
                if (!rt.success) return rt

                rest.push(rt.value)
            }

            values.push(rest)
        } else if (i < args.length) {
            const rt = await valueOf(fn, ctx, param, args[i])
            if (!rt.success) return rt

            values.push(rt.value)
        } else {
            values.push(undefined)
        }
    }

    return new Return(ReturnType.Success, values)
}

async function valueOf(fn: CompiledFunction, ctx: Context, param: IParam, text: string): Promise<Return> {
    if (param.type === ArgType.String) return new Return(ReturnType.Success, text)

    const arg: IArg = { name: param.name, description: "", type: param.type, required: param.required, rest: false }
    return fn["resolveArg"](ctx, arg, {}, text, [])
}
