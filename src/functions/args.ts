import { Arg } from "@tryforge/forgescript"

/** An optional rest string arg. ForgeScript 2.3.0's `Arg.restString` makes every rest arg required. */
export function optionalRest(name: string, desc: string) {
    return { ...Arg.restString(name, desc), required: false }
}
