"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassManager = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const structures_1 = require("../structures");
const result_1 = require("../functions/result");
class ClassManager {
    classes = new Map();
    hidden = new WeakMap();
    hiddenOf(instance) {
        let slots = this.hidden.get(instance);
        if (!slots)
            this.hidden.set(instance, (slots = new Map()));
        return slots;
    }
    get(name) {
        return this.classes.get(name) ?? null;
    }
    has(name) {
        return this.classes.has(name);
    }
    get names() {
        return [...this.classes.keys()];
    }
    clear() {
        this.classes.clear();
    }
    define(...defs) {
        const names = new Set();
        for (const def of defs) {
            if (!def.name)
                return (0, result_1.fail)("A class has no name.");
            if (names.has(def.name))
                return (0, result_1.fail)(`The class ${def.name} is declared twice.`);
            names.add(def.name);
        }
        const before = new Map(this.classes);
        for (const def of defs)
            this.classes.set(def.name, def);
        for (const def of defs) {
            const checked = this.checkParents(def);
            if (checked.ok)
                continue;
            this.classes.clear();
            for (const [name, kept] of before)
                this.classes.set(name, kept);
            return checked;
        }
        return result_1.done;
    }
    /** `define` for plain objects, throws instead of returning the reason. */
    add(...data) {
        this.addFrom(data.flat().map((item) => ({ item })));
    }
    load(dir) {
        const root = (0, node_path_1.resolve)(dir);
        const files = (0, node_fs_1.readdirSync)(root, { recursive: true, encoding: "utf8" }).filter((file) => file.endsWith(".js"));
        this.addFrom(files.flatMap((file) => {
            const loaded = require((0, node_path_1.join)(root, file));
            if (Object.keys(loaded).length === 0)
                return [];
            const exported = loaded.default ?? loaded;
            return [exported].flat().map((item) => ({ item, file }));
        }));
    }
    delete(name) {
        if (!this.classes.has(name))
            return (0, result_1.ok)(false);
        const children = this.childrenOf(name);
        if (children.length) {
            const verb = children.length === 1 ? "extends" : "extend";
            return (0, result_1.fail)(`${name} can't be deleted while ${children.join(", ")} ${verb} it.`);
        }
        this.classes.delete(name);
        return (0, result_1.ok)(true);
    }
    childrenOf(name) {
        return [...this.classes.values()].filter((def) => def.parent === name).map((def) => def.name);
    }
    /** Stops at the first missing parent. */
    chainOf(def) {
        const chain = [def];
        const seen = new Set([def.name]);
        for (let parent = def.parent; parent !== null && !seen.has(parent);) {
            const found = this.classes.get(parent);
            if (!found)
                break;
            chain.push(found);
            seen.add(parent);
            parent = found.parent;
        }
        return chain;
    }
    findMethod(def, name) {
        for (const owner of this.chainOf(def)) {
            const method = owner.methods.get(name);
            if (method)
                return { ...method, name, owner };
        }
        return null;
    }
    methodNamesOf(def) {
        const names = new Set();
        for (const owner of this.chainOf(def)) {
            for (const name of owner.methods.keys())
                if (name !== structures_1.CONSTRUCTOR)
                    names.add(name);
        }
        return [...names];
    }
    /** Parents' first. */
    fieldsOf(def) {
        const fields = new Map();
        for (const owner of this.chainOf(def).reverse()) {
            for (const [name, body] of owner.fields)
                fields.set(name, { owner, body });
        }
        return fields;
    }
    declares(def, field) {
        return this.chainOf(def).some((owner) => owner.fields.has(field));
    }
    isA(def, ancestor) {
        return this.chainOf(def).some((owner) => owner.name === ancestor);
    }
    checkParents(def) {
        const seen = [def.name];
        let current = def;
        while (current.parent !== null) {
            const parent = current.parent;
            if (seen.includes(parent)) {
                return (0, result_1.fail)(`${[...seen, parent].join(" → ")}: these classes extend each other in a circle.`);
            }
            const found = this.classes.get(parent);
            if (!found)
                return (0, result_1.fail)(`${current.name} extends ${parent}, which is not defined.`);
            seen.push(parent);
            current = found;
        }
        return result_1.done;
    }
    addFrom(entries) {
        const defs = [];
        for (const { item, file } of entries) {
            const def = definitionOf(item);
            if (!def.ok)
                throw new Error(`ForgeClass | ${file ? `${file}: ` : ""}${def.reason}`);
            defs.push(def.value);
        }
        const defined = this.define(...defs);
        if (!defined.ok)
            throw new Error(`ForgeClass | ${defined.reason}`);
    }
}
exports.ClassManager = ClassManager;
function definitionOf(data) {
    if (typeof data?.name !== "string" || !data.name)
        return (0, result_1.fail)("A class has no name.");
    const def = new structures_1.ClassDefinition(data.name);
    if (data.extends !== undefined) {
        const extended = def.extend(data.extends);
        if (!extended.ok)
            return extended;
    }
    for (const [name, code] of Object.entries(data.fields ?? {})) {
        const added = def.addField(name, new structures_1.Body(String(code)));
        if (!added.ok)
            return added;
    }
    for (const [name, method] of Object.entries(data.methods ?? {})) {
        const { params = [], code } = typeof method === "string" ? { code: method } : method;
        if (typeof code !== "string")
            return (0, result_1.fail)(`${def.describeMethod(name)} has no code.`);
        const added = def.addMethod(name, params, new structures_1.Body(code));
        if (!added.ok)
            return added;
    }
    return (0, result_1.ok)(def);
}
//# sourceMappingURL=ClassManager.js.map