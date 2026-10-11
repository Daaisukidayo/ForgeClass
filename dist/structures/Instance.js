"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLASS_KEY = void 0;
exports.isInstance = isInstance;
exports.fieldsOf = fieldsOf;
exports.CLASS_KEY = "__class";
function isInstance(value) {
    return (typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        typeof value[exports.CLASS_KEY] === "string");
}
function fieldsOf(instance) {
    const fields = { ...instance };
    delete fields[exports.CLASS_KEY];
    return fields;
}
//# sourceMappingURL=Instance.js.map