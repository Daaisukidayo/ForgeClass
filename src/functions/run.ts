import { CompiledFunction, Context, Return, ReturnType } from "@tryforge/forgescript"
import { Body, ClassDefinition, CLASS_KEY, Code, CONSTRUCTOR, IInstance } from "../structures"
import { IFoundMethod } from "../managers"
import { slotOf } from "./hidden"
import { arityOf, valuesOf } from "./params"
import { FRAME } from "./scope"
import { parseValue } from "./value"

export function failureOf(fn: CompiledFunction, rt: Return, where: string, allowReturn = true): Return | null {
    if (rt.success || (rt.return && allowReturn)) return null

    if (rt.return) return fn.customError(`$return can't be used in ${where}.`)
    if (rt.break || rt.continue) {
        return fn.customError(`$${rt.break ? "break" : "continue"} is not inside a loop in ${where}.`)
    }

    return rt
}

async function runIn(fn: CompiledFunction, scope: Context, body: Body, where: string, allowReturn = true) {
    let code: Code

    try {
        code = body.code
    } catch (err) {
        return fn.customError(`Could not compile ${where}: ${err instanceof Error ? err.message : String(err)}`)
    }

    const rt: Return = await fn["resolveCode"](scope, code)
    return failureOf(fn, rt, where, allowReturn) ?? new Return(ReturnType.Success, rt.value)
}

export async function runMethod(
    fn: CompiledFunction,
    ctx: Context,
    instance: IInstance,
    method: IFoundMethod,
    args: string[]
) {
    const where = method.owner.describeMethod(method.name)

    const { min, max } = arityOf(method.params)

    if (args.length < min || args.length > max) {
        const short = args.length < min
        const wanted = min === max ? `${min}` : short ? `at least ${min}` : `at most ${max}`
        const count = short ? min : max

        return fn.customError(`${where} takes ${wanted} argument${count === 1 ? "" : "s"}, got ${args.length}.`)
    }

    const values = await valuesOf(fn, ctx, method.params, args)
    if (!values.success) return values

    const scope = ctx.clone()
    scope.setEnvironmentKey("this", instance)
    method.params.forEach((param, i) => scope.setEnvironmentKey(param.name, (values.value as unknown[])[i]))
    scope[FRAME] = { owner: method.owner, instance }

    return runIn(fn, scope, method.body, where)
}

/** Field defaults from the root class down, then the constructor. Succeeds with the instance. */
export async function construct(fn: CompiledFunction, ctx: Context, def: ClassDefinition, args: string[]) {
    const classes = ctx.client.classes
    const instance: IInstance = { [CLASS_KEY]: def.name }

    const scope = ctx.clone()
    scope.setEnvironmentKey("this", instance)

    for (const [field, { owner, body }] of classes.fieldsOf(def)) {
        const rt = await runIn(fn, scope, body, `the default of ${owner.name}.${field}`, false)
        if (!rt.success) return rt

        instance[field] = parseValue(String(rt.value ?? ""))
    }

    for (const owner of classes.chainOf(def).reverse()) {
        if (!owner.hiddenFields.size) continue

        // as the class's own code, so its defaults reach its other # fields
        const own = ctx.clone()
        own.setEnvironmentKey("this", instance)
        own[FRAME] = { owner, instance }

        for (const [field, body] of owner.hiddenFields) {
            const rt = await runIn(fn, own, body, `the default of ${owner.name}.${field}`, false)
            if (!rt.success) return rt

            classes.hiddenOf(instance).set(slotOf(owner, field), parseValue(String(rt.value ?? "")))
        }
    }

    const constructor = classes.findMethod(def, CONSTRUCTOR)

    if (constructor) {
        const rt = await runMethod(fn, ctx, instance, constructor, args)
        if (!rt.success) return rt
    } else if (args.length) {
        return fn.customError(`${def.name} has no constructor, so it takes no arguments, got ${args.length}.`)
    }

    return new Return(ReturnType.Success, instance)
}
