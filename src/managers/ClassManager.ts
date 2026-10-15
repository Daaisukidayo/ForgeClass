import type { RecursiveArray } from "@tryforge/forgescript"
import { readdirSync } from "node:fs"
import { join, resolve as resolvePath } from "node:path"
import { Body, ClassDefinition, CONSTRUCTOR, ForgeClassBuilder, IField, IInstance, IMethod } from "../structures"
import { done, fail, ok, Result } from "../functions/result"
import { IClassData } from "../types"

export type ClassInput = IClassData | ForgeClassBuilder

export interface IFoundMethod extends IMethod {
    name: string
    owner: ClassDefinition
}

export interface IFoundField extends IField {
    owner: ClassDefinition
}

export class ClassManager {
    private readonly classes = new Map<string, ClassDefinition>()

    private readonly hidden = new WeakMap<IInstance, Map<string, unknown>>()

    public hiddenOf(instance: IInstance) {
        let slots = this.hidden.get(instance)
        if (!slots) this.hidden.set(instance, (slots = new Map()))

        return slots
    }

    public get(name: string) {
        return this.classes.get(name) ?? null
    }

    public has(name: string) {
        return this.classes.has(name)
    }

    public get names() {
        return [...this.classes.keys()]
    }

    public clear() {
        this.classes.clear()
    }

    public define(...defs: ClassDefinition[]): Result<void> {
        const names = new Set<string>()

        for (const def of defs) {
            if (!def.name) return fail("A class has no name.")
            if (names.has(def.name)) return fail(`The class ${def.name} is declared twice.`)

            names.add(def.name)
        }

        const before = new Map(this.classes)
        for (const def of defs) this.classes.set(def.name, def)

        for (const def of defs) {
            const checked = this.checkParents(def)
            if (checked.ok) continue

            this.classes.clear()
            for (const [name, kept] of before) this.classes.set(name, kept)

            return checked
        }

        return done
    }

    /** `define` for plain objects and builders, throws instead of returning the reason. */
    public add(...options: RecursiveArray<ClassInput>[]) {
        this.addFrom(flatten(options).map((option) => ({ item: this.resolve(option).data })))
    }

    public resolve(option: ClassInput) {
        return option instanceof ForgeClassBuilder ? option : new ForgeClassBuilder(option)
    }

    public load(dir: string) {
        const root = resolvePath(dir)

        const files = readdirSync(root, { recursive: true, encoding: "utf8" }).filter((file) => file.endsWith(".js"))

        this.addFrom(
            files.flatMap((file) => {
                const loaded = require(join(root, file))
                if (Object.keys(loaded).length === 0) return []

                return flatten([loaded.default ?? loaded]).map((option) => ({ item: this.resolve(option).data, file }))
            })
        )
    }

    public delete(name: string): Result<boolean> {
        if (!this.classes.has(name)) return ok(false)

        const children = this.childrenOf(name)
        if (children.length) {
            const verb = children.length === 1 ? "extends" : "extend"
            return fail(`${name} can't be deleted while ${children.join(", ")} ${verb} it.`)
        }

        this.classes.delete(name)
        return ok(true)
    }

    public childrenOf(name: string) {
        return [...this.classes.values()].filter((def) => def.parent === name).map((def) => def.name)
    }

    /** Stops at the first missing parent. */
    public chainOf(def: ClassDefinition) {
        const chain = [def]
        const seen = new Set([def.name])

        for (let parent = def.parent; parent !== null && !seen.has(parent);) {
            const found = this.classes.get(parent)
            if (!found) break

            chain.push(found)
            seen.add(parent)
            parent = found.parent
        }

        return chain
    }

    public findMethod(def: ClassDefinition, name: string): IFoundMethod | null {
        return this.memberOf(def, name, (owner) => owner.methods)
    }

    public staticMethodOf(def: ClassDefinition, name: string): IFoundMethod | null {
        return this.memberOf(def, name, (owner) => owner.staticMethods)
    }

    public fieldOf(def: ClassDefinition, name: string): IFoundField | null {
        return this.memberOf(def, name, (owner) => owner.fields)
    }

    public staticFieldOf(def: ClassDefinition, name: string): IFoundField | null {
        return this.memberOf(def, name, (owner) => owner.staticFields)
    }

    /** Public ones, without the constructor. */
    public methodNamesOf(def: ClassDefinition) {
        const names = new Set<string>()

        for (const owner of this.chainOf(def)) {
            for (const [name, method] of owner.methods) {
                if (name !== CONSTRUCTOR && method.access === "public") names.add(name)
            }
        }

        return [...names]
    }

    /** Parents' first. */
    public fieldsOf(def: ClassDefinition) {
        const fields = new Map<string, IFoundField>()

        for (const owner of this.chainOf(def).reverse()) {
            for (const [name, field] of owner.fields) fields.set(name, { ...field, owner })
        }

        return fields
    }

    public declares(def: ClassDefinition, field: string) {
        return this.fieldOf(def, field) !== null
    }

    private memberOf<T>(def: ClassDefinition, name: string, members: (owner: ClassDefinition) => Map<string, T>) {
        for (const owner of this.chainOf(def)) {
            const member = members(owner).get(name)
            if (member) return { ...member, name, owner }
        }

        return null
    }

    public isA(def: ClassDefinition, ancestor: string) {
        return this.chainOf(def).some((owner) => owner.name === ancestor)
    }

    private checkParents(def: ClassDefinition): Result<void> {
        const seen = [def.name]
        let current = def

        while (current.parent !== null) {
            const parent = current.parent

            if (seen.includes(parent)) {
                return fail(`${[...seen, parent].join(" → ")}: these classes extend each other in a circle.`)
            }

            const found = this.classes.get(parent)
            if (!found) return fail(`${current.name} extends ${parent}, which is not defined.`)

            seen.push(parent)
            current = found
        }

        return done
    }

    private addFrom(entries: Array<{ item: IClassData; file?: string }>) {
        const defs: ClassDefinition[] = []

        for (const { item, file } of entries) {
            const def = definitionOf(item)
            if (!def.ok) throw new Error(`ForgeClass | ${file ? `${file}: ` : ""}${def.reason}`)

            defs.push(def.value)
        }

        const defined = this.define(...defs)
        if (!defined.ok) throw new Error(`ForgeClass | ${defined.reason}`)
    }
}

const flatten = (options: unknown[]) => options.flat(Infinity) as ClassInput[]

function definitionOf(data: IClassData): Result<ClassDefinition> {
    if (typeof data?.name !== "string" || !data.name) return fail("A class has no name.")

    const def = new ClassDefinition(data.name)

    if (data.extends !== undefined) {
        const extended = def.extend(data.extends)
        if (!extended.ok) return extended
    }

    for (const [name, code] of Object.entries(data.fields ?? {})) {
        const added = def.addField(name, new Body(String(code)))
        if (!added.ok) return added
    }

    for (const [name, method] of Object.entries(data.methods ?? {})) {
        const { params = [], code } = typeof method === "string" ? { code: method } : method
        if (typeof code !== "string") return fail(`${def.describeMethod(name)} has no code.`)

        const added = def.addMethod(name, params, new Body(code))
        if (!added.ok) return added
    }

    return ok(def)
}
