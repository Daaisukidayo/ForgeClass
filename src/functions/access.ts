import type { Context } from "@tryforge/forgescript"
import { ClassDefinition, CONSTRUCTOR, IInstance } from "../structures"
import type { Access } from "./declaration"
import { FRAME } from "./scope"

/** Private reaches from the declaring class only, protected from it and its children too. */
export function canReach(ctx: Context, owner: ClassDefinition, access: Access) {
    if (access === "public") return true

    const running = ctx[FRAME]?.owner
    if (!running) return false

    return access === "private" ? running.name === owner.name : ctx.client.classes.isA(running, owner.name)
}

export const unreachable = (owner: ClassDefinition, name: string, access: Access) =>
    `${owner.name}.${name} is ${access}.`

/** Readonly fields are set by their defaults, or in the constructor of the same instance. */
export function canWrite(ctx: Context, instance: IInstance) {
    const frame = ctx[FRAME]
    return frame?.method === CONSTRUCTOR && frame.instance === instance
}
