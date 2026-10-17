import type { Context } from "@tryforge/forgescript"
import { ClassDefinition, CONSTRUCTOR, IInstance } from "../structures"
import type { Access } from "./declaration"
import { FRAME } from "./scope"

/** Whether the running code reaches the member: private from its class only, protected from its children too. */
export function canReach(ctx: Context, owner: ClassDefinition, access: Access) {
    if (access === "public") return true

    const running = ctx[FRAME]?.owner
    if (!running) return false

    return access === "private" ? running.name === owner.name : ctx.client.classes.isA(running, owner.name)
}

/** The error for a member out of reach. */
export const unreachable = (owner: ClassDefinition, name: string, access: Access) =>
    `${owner.name}.${name} is ${access}.`

/** Whether readonly fields of the instance can be set here. Only its constructor can, besides the defaults. */
export function canWrite(ctx: Context, instance: IInstance) {
    const frame = ctx[FRAME]
    return frame?.method === CONSTRUCTOR && frame.instance === instance
}
