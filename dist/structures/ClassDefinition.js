"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassDefinition = exports.isHidden = exports.CONSTRUCTOR = void 0;
const Instance_1 = require("./Instance");
const declaration_1 = require("../functions/declaration");
const keys_1 = require("../functions/keys");
const params_1 = require("../functions/params");
const result_1 = require("../functions/result");
/** The constructor's method name. */
exports.CONSTRUCTOR = "constructor";
/** Whether it's a `#` name. */
const isHidden = (name) => name.startsWith("#");
exports.isHidden = isHidden;
/** A declared class. It holds its own members only, the ClassManager finds inherited ones. */
class ClassDefinition {
    name;
    /** The class it extends. */
    parent = null;
    /** Instance fields, without `#` ones. */
    fields = new Map();
    /** Instance methods and the constructor, without `#` ones. */
    methods = new Map();
    /** `#` fields. */
    hiddenFields = new Map();
    /** `#` methods. */
    hiddenMethods = new Map();
    /** Static fields, `#` ones included. */
    staticFields = new Map();
    /** Static methods, `#` ones included. */
    staticMethods = new Map();
    /** Values of the static fields, each set on first use. */
    statics = new Map();
    constructor(name) {
        this.name = name;
    }
    /** `A.m`, or `A's constructor`, for messages. */
    describeMethod(method) {
        return method === exports.CONSTRUCTOR ? `${this.name}'s constructor` : `${this.name}.${method}`;
    }
    /** Sets the parent. Fails when it has one already, or the name is empty or its own. */
    extend(parent) {
        if (this.parent !== null)
            return (0, result_1.fail)(`${this.name} already extends ${this.parent}.`);
        if (!parent)
            return (0, result_1.fail)(`${this.name} extends a class with no name.`);
        if (parent === this.name)
            return (0, result_1.fail)(`${this.name} can't extend itself.`);
        this.parent = parent;
        return result_1.done;
    }
    /**
     * Declares a field. Fails on a bad name or modifiers, or a field declared already.
     * @param declaration The name, with its modifiers before it.
     */
    addField(declaration, body) {
        const parsed = (0, declaration_1.parseDeclaration)(declaration, "field");
        if (!parsed.ok)
            return (0, result_1.fail)(`${this.name}: ${parsed.reason}`);
        const { name, access, readonly } = parsed.value;
        if (!(0, exports.isHidden)(name)) {
            if (name === Instance_1.CLASS_KEY)
                return (0, result_1.fail)(`"${Instance_1.CLASS_KEY}" holds the class name and can't be a field.`);
            const checked = (0, keys_1.checkName)(name, "a field name");
            if (!checked.ok)
                return checked;
        }
        const fields = parsed.value.static ? this.staticFields : (0, exports.isHidden)(name) ? this.hiddenFields : this.fields;
        if (fields.has(name))
            return (0, result_1.fail)(`${this.name}.${name} is declared twice.`);
        fields.set(name, { body, access, readonly });
        return result_1.done;
    }
    /**
     * Declares a method or the constructor. Fails on a bad name, modifiers or params, or a method declared already.
     * @param declaration The name, with its modifiers before it.
     */
    addMethod(declaration, params, body) {
        const parsed = (0, declaration_1.parseDeclaration)(declaration, "method");
        if (!parsed.ok)
            return (0, result_1.fail)(`${this.name}: ${parsed.reason}`);
        const { name, access } = parsed.value;
        const label = this.describeMethod(name);
        const methods = parsed.value.static ? this.staticMethods : (0, exports.isHidden)(name) ? this.hiddenMethods : this.methods;
        if (methods.has(name))
            return (0, result_1.fail)(`${label} is declared twice.`);
        const read = (0, params_1.toParams)(params);
        if (!read.ok)
            return (0, result_1.fail)(`${label}: ${read.reason}`);
        const names = read.value.map((param) => param.name);
        for (const [i, param] of names.entries()) {
            const checked = (0, keys_1.checkName)(param, "a parameter name");
            if (!checked.ok)
                return (0, result_1.fail)(`${label}: ${checked.reason}`);
            if (param === "this")
                return (0, result_1.fail)(`${label}: "this" is the instance and can't be a parameter.`);
            if (names.indexOf(param) !== i)
                return (0, result_1.fail)(`${label} has two parameters named "${param}".`);
        }
        methods.set(name, { params: read.value, body, access });
        return result_1.done;
    }
}
exports.ClassDefinition = ClassDefinition;
//# sourceMappingURL=ClassDefinition.js.map