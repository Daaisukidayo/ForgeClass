import { fail, ok, Result } from "./result"

/** Where a member can be reached from. */
export type Access = "public" | "protected" | "private"

/** A member name with its modifiers. */
export interface IDeclaration {
    name: string
    access: Access
    static: boolean
    readonly: boolean
}

const WORDS = new Set(["public", "protected", "private", "static", "readonly"])

const ACCESS = new Set(["public", "protected", "private"])

/** Splits `private readonly hp` into the name and its modifiers. Fails on unknown, repeated or clashing ones. */
export function parseDeclaration(text: string, kind: "field" | "method"): Result<IDeclaration> {
    const words = text.trim().split(/\s+/)
    const name = words.pop() ?? ""
    if (!name) return fail(`A ${kind} has no name.`)

    const used = new Set<string>()

    for (const word of words) {
        if (!WORDS.has(word)) {
            return fail(`"${word}" is not a modifier of ${name}. Use public, protected, private, static or readonly.`)
        }
        if (used.has(word)) return fail(`${name} has "${word}" twice.`)

        used.add(word)
    }

    const access = [...used].filter((word) => ACCESS.has(word))

    if (name === "#") return fail(`A # ${kind} needs a name after the #.`)
    if (name === "#constructor") return fail(`"#constructor" can't be a name.`)
    if (access.length > 1) return fail(`${name} can't be both ${access[0]} and ${access[1]}.`)
    if (name.startsWith("#") && access.length)
        return fail(`${name} is private through its #, so it can't be ${access[0]}.`)
    if (kind === "method" && used.has("readonly")) return fail(`The method ${name} can't be readonly.`)
    if (name === "constructor" && used.size) return fail("The constructor takes no modifiers.")

    return ok({
        name,
        access: (access[0] as Access | undefined) ?? (name.startsWith("#") ? "private" : "public"),
        static: used.has("static"),
        readonly: used.has("readonly"),
    })
}
