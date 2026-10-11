import { Arg } from "@tryforge/forgescript"

/** ForgeScript 2.3.0's Arg.restString makes every rest argument required. */
export function optionalRest(name: string, desc: string) {
    return { ...Arg.restString(name, desc), required: false }
}
