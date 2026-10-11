"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORBIDDEN_KEYS = void 0;
exports.checkName = checkName;
const result_1 = require("./result");
exports.FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);
/** @param what For the message, as in "a field name". */
function checkName(name, what) {
    if (!name)
        return (0, result_1.fail)(`${what[0].toUpperCase()}${what.slice(1)} can't be empty.`);
    if (exports.FORBIDDEN_KEYS.has(name))
        return (0, result_1.fail)(`"${name}" can't be ${what}, it leads to the prototype.`);
    return (0, result_1.ok)(name);
}
//# sourceMappingURL=keys.js.map