"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassManager = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const structures_1 = require("../structures");
const result_1 = require("../functions/result");
/** The classes of a client, at `client.classes`. */
class ClassManager {
    classes = new Map();
    hidden = new WeakMap();
    /** The `#` field values of an instance, keyed by `slotOf`. Made on first use. */
    hiddenOf(instance) {
        let slots = this.hidden.get(instance);
        if (!slots)
            this.hidden.set(instance, (slots = new Map()));
        return slots;
    }
    /** The class, or null. */
    get(name) {
        return this.classes.get(name) ?? null;
    }
    /** Whether the class is declared. */
    has(name) {
        return this.classes.has(name);
    }
    /** The names of every class. */
    get names() {
        return [...this.classes.keys()];
    }
    /** Deletes every class. */
    clear() {
        this.classes.clear();
    }
    /**
     * Adds or replaces classes, all or none. Parents may come in any order.
     * Fails on a missing or repeated name, a missing parent, or a circle.
     */
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
    /** `define` for plain objects and builders, throws instead of returning the reason. */
    add(...options) {
        this.addFrom(flatten(options).map((option) => ({ item: this.resolve(option).data })));
    }
    /** Wraps a plain object in a builder. */
    resolve(option) {
        return option instanceof structures_1.ForgeClassBuilder ? option : new structures_1.ForgeClassBuilder(option);
    }
    /**
     * Adds the classes every `.js` file in the folder exports, subfolders included.
     * Throws like `add()`, naming the file.
     * @param dir Relative to the working directory.
     */
    load(dir) {
        const root = (0, node_path_1.resolve)(dir);
        const files = (0, node_fs_1.readdirSync)(root, { recursive: true, encoding: "utf8" }).filter((file) => file.endsWith(".js"));
        this.addFrom(files.flatMap((file) => {
            const loaded = require((0, node_path_1.join)(root, file));
            if (Object.keys(loaded).length === 0)
                return [];
            return flatten([loaded.default ?? loaded]).map((option) => ({ item: this.resolve(option).data, file }));
        }));
    }
    /** Deletes a class unless another one extends it. Succeeds with whether it existed. */
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
    /** The classes that extend it directly. */
    childrenOf(name) {
        return [...this.classes.values()].filter((def) => def.parent === name).map((def) => def.name);
    }
    /** The class and its parents, nearest first. Stops at a missing parent. */
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
    /** An instance method or the constructor, inherited ones included, `#` ones not. */
    findMethod(def, name) {
        return this.memberOf(def, name, (owner) => owner.methods);
    }
    /** A static method, inherited ones included. */
    staticMethodOf(def, name) {
        return this.memberOf(def, name, (owner) => owner.staticMethods);
    }
    /** An instance field, inherited ones included, `#` ones not. */
    fieldOf(def, name) {
        return this.memberOf(def, name, (owner) => owner.fields);
    }
    /** A static field, inherited ones included. */
    staticFieldOf(def, name) {
        return this.memberOf(def, name, (owner) => owner.staticFields);
    }
    /** Public method names, inherited ones included, without the constructor. */
    methodNamesOf(def) {
        const names = new Set();
        for (const owner of this.chainOf(def)) {
            for (const [name, method] of owner.methods) {
                if (name !== structures_1.CONSTRUCTOR && method.access === "public")
                    names.add(name);
            }
        }
        return [...names];
    }
    /** Instance fields with the class that declares each, parents' first. A redeclared field keeps its place. */
    fieldsOf(def) {
        const fields = new Map();
        for (const owner of this.chainOf(def).reverse()) {
            for (const [name, field] of owner.fields)
                fields.set(name, { ...field, owner });
        }
        return fields;
    }
    /** Whether the class or a parent declares the field. */
    declares(def, field) {
        return this.fieldOf(def, field) !== null;
    }
    /** The member from the first class up the chain that has it. */
    memberOf(def, name, members) {
        for (const owner of this.chainOf(def)) {
            const member = members(owner).get(name);
            if (member)
                return { ...member, name, owner };
        }
        return null;
    }
    /** Whether the class is `ancestor` or extends it. */
    isA(def, ancestor) {
        return this.chainOf(def).some((owner) => owner.name === ancestor);
    }
    /** Fails when a parent is missing or the classes extend each other in a circle. */
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
    /** Makes classes from the data and defines them, throwing on the first problem. */
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
/** Flattens arrays of classes, nested as deep as they go. */
const flatten = (options) => options.flat(Infinity);
/** Makes a class from its data. */
function definitionOf(data) {
    if (typeof data?.name !== "string" || !data.name)
        return (0, result_1.fail)("A class has no name.");
    const def = new structures_1.ClassDefinition(data.name);
    if (data.extends !== undefined) {
        const extended = def.extend(data.extends);
        if (!extended.ok)
            return extended;
    }
    for (const [name, value] of Object.entries(data.fields ?? {})) {
        if (!isDefault(value)) {
            return (0, result_1.fail)(`${def.name}: "${name}" can only default to strings, numbers, booleans, null, arrays and objects.`);
        }
        const added = def.addField(name, structures_1.Body.of(value));
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
/** Whether the value is a string, number, boolean or null, or an array or plain object of them. */
function isDefault(value, parents = []) {
    if (value === null || ["string", "number", "boolean"].includes(typeof value))
        return true;
    if (typeof value !== "object" || parents.includes(value))
        return false;
    const proto = Object.getPrototypeOf(value);
    if (!Array.isArray(value) && proto !== Object.prototype && proto !== null)
        return false;
    return Object.values(value).every((item) => isDefault(item, [...parents, value]));
}
//# sourceMappingURL=ClassManager.js.map