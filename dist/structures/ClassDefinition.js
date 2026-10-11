"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassDefinition = exports.isHidden = exports.CONSTRUCTOR = void 0;
const Instance_1 = require("./Instance");
const keys_1 = require("../functions/keys");
const params_1 = require("../functions/params");
const result_1 = require("../functions/result");
exports.CONSTRUCTOR = "constructor";
const isHidden = (name) => name.startsWith("#");
exports.isHidden = isHidden;
/** Own members only, the ClassManager finds inherited ones. */
class ClassDefinition {
    name;
    parent = null;
    fields = new Map();
    methods = new Map();
    hiddenFields = new Map();
    hiddenMethods = new Map();
    constructor(name) {
        this.name = name;
    }
    describeMethod(method) {
        return method === exports.CONSTRUCTOR ? `${this.name}'s constructor` : `${this.name}.${method}`;
    }
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
    addField(name, body) {
        if ((0, exports.isHidden)(name)) {
            const checked = this.checkHidden(name);
            if (!checked.ok)
                return checked;
        }
        else {
            if (name === Instance_1.CLASS_KEY)
                return (0, result_1.fail)(`"${Instance_1.CLASS_KEY}" holds the class name and can't be a field.`);
            const checked = (0, keys_1.checkName)(name, "a field name");
            if (!checked.ok)
                return checked;
        }
        const fields = (0, exports.isHidden)(name) ? this.hiddenFields : this.fields;
        if (fields.has(name))
            return (0, result_1.fail)(`${this.name}.${name} is declared twice.`);
        fields.set(name, body);
        return result_1.done;
    }
    addMethod(name, params, body) {
        if (!name)
            return (0, result_1.fail)(`A method of ${this.name} has no name.`);
        if ((0, exports.isHidden)(name)) {
            const checked = this.checkHidden(name);
            if (!checked.ok)
                return checked;
        }
        const label = this.describeMethod(name);
        const methods = (0, exports.isHidden)(name) ? this.hiddenMethods : this.methods;
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
        methods.set(name, { params: read.value, body });
        return result_1.done;
    }
    checkHidden(name) {
        if (name === "#")
            return (0, result_1.fail)(`${this.name}: a # needs a name after it.`);
        if (name === "#constructor")
            return (0, result_1.fail)(`${this.name}: "#constructor" can't be a name.`);
        return result_1.done;
    }
}
exports.ClassDefinition = ClassDefinition;
//# sourceMappingURL=ClassDefinition.js.map