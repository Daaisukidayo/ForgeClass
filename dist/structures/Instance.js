"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLASS_KEY = void 0;
exports.isInstance = isInstance;
exports.fieldsOf = fieldsOf;
/** The instance field that holds its class name. */
exports.CLASS_KEY = "__class";
/** Whether the value is an instance, of a declared class or not. */
function isInstance(value) {
    return (typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        typeof value[exports.CLASS_KEY] === "string");
}
/** A copy of the fields, without `__class`. */
function fieldsOf(instance) {
    const fields = { ...instance };
    delete fields[exports.CLASS_KEY];
    return fields;
}
//# sourceMappingURL=Instance.js.map