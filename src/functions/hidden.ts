import type { Context } from "@tryforge/forgescript"
import { ClassDefinition } from "../structures"
import { IFoundMethod } from "../managers"
import { FRAME } from "./scope"
import { fail, ok, Result } from "./result"

// A # member belongs to the class whose method is running, not to the instance's class.

/** Where a `#` field is kept in `ClassManager.hiddenOf`. */
export const slotOf = (owner: ClassDefinition, name: string) => `${owner.name}${name}`

/** The class whose code is running. Fails outside class code. */
function runningClass(ctx: Context, name: string): Result<ClassDefinition> {
    const frame = ctx[FRAME]
    return frame ? ok(frame.owner) : fail(`${name} can only be used inside the methods of its class.`)
}

/** Checks that the running class has the `#` field and the instance is of it. Succeeds with that class. */
export function hiddenField(ctx: Context, def: ClassDefinition, name: string) {
    const owner = runningClass(ctx, name)
    if (!owner.ok) return owner

    if (!owner.value.hiddenFields.has(name)) return fail(`${owner.value.name} has no field ${name}.`)
    return brand(ctx, owner.value, def, name)
}

/** A `#` method of the running class, when the instance is of it. */
export function hiddenMethod(ctx: Context, def: ClassDefinition, name: string): Result<IFoundMethod> {
    const owner = runningClass(ctx, name)
    if (!owner.ok) return owner

    const method = owner.value.hiddenMethods.get(name)
    if (!method) return fail(`${owner.value.name} has no method ${name}.`)

    const branded = brand(ctx, owner.value, def, name)
    return branded.ok ? ok({ ...method, name, owner: owner.value }) : branded
}

/** Whether the running class has the `#` field and the instance is of it. */
export function hasHiddenField(ctx: Context, def: ClassDefinition, name: string) {
    const owner = runningClass(ctx, name)
    if (!owner.ok) return owner

    return ok(owner.value.hiddenFields.has(name) && ctx.client.classes.isA(def, owner.value.name))
}

/** Whether the running class has the `#` method and the instance is of it. */
export function hasHiddenMethod(ctx: Context, def: ClassDefinition, name: string) {
    const owner = runningClass(ctx, name)
    if (!owner.ok) return owner

    return ok(owner.value.hiddenMethods.has(name) && ctx.client.classes.isA(def, owner.value.name))
}

/** Fails unless the instance's class is the owner or extends it. */
function brand(ctx: Context, owner: ClassDefinition, def: ClassDefinition, name: string) {
    return ctx.client.classes.isA(def, owner.name)
        ? ok(owner)
        : fail(`${name} belongs to ${owner.name}, and this is a ${def.name}.`)
}
