import { ArgType } from "@tryforge/forgescript"

/** The types a param can have: ForgeScript's arg types without Enum, which has no values to pick from. */
export const ParamType = Object.fromEntries(
    // the value check drops Enum's reverse mapping, from its number to its name
    Object.entries(ArgType).filter(([key, value]) => key !== "Enum" && value !== "Enum")
) as unknown as Omit<typeof ArgType, "Enum">
