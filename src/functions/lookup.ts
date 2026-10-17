import type { Context } from "@tryforge/forgescript"
import { ClassDefinition, CLASS_KEY, IInstance, isInstance } from "../structures"
import { ClassManager } from "../managers"
import { fail, ok, Result } from "./result"

/** An instance with its class. */
export interface IFoundInstance {
    instance: IInstance
    def: ClassDefinition
}

/** The instance in a variable, with its class. Fails when there's none or its class isn't declared. */
export function instanceIn(ctx: Context, variable: string): Result<IFoundInstance> {
    const value = ctx.getEnvironmentKey(variable)
    if (!isInstance(value)) return fail(`"${variable}" does not hold a class instance.`)

    const def = ctx.client.classes.get(value[CLASS_KEY])
    if (!def) return fail(`"${variable}" is an instance of ${value[CLASS_KEY]}, which is not defined.`)

    return ok({ instance: value, def })
}

/** The class, or a failure saying it isn't declared. */
export function classNamed(classes: ClassManager, name: string): Result<ClassDefinition> {
    const def = classes.get(name)
    return def ? ok(def) : fail(`The class ${name} is not defined.`)
}
