"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instanceIn = instanceIn;
exports.classNamed = classNamed;
const structures_1 = require("../structures");
const result_1 = require("./result");
/** The instance in a variable, with its class. Fails when there's none or its class isn't declared. */
function instanceIn(ctx, variable) {
    const value = ctx.getEnvironmentKey(variable);
    if (!(0, structures_1.isInstance)(value))
        return (0, result_1.fail)(`"${variable}" does not hold a class instance.`);
    const def = ctx.client.classes.get(value[structures_1.CLASS_KEY]);
    if (!def)
        return (0, result_1.fail)(`"${variable}" is an instance of ${value[structures_1.CLASS_KEY]}, which is not defined.`);
    return (0, result_1.ok)({ instance: value, def });
}
/** The class, or a failure saying it isn't declared. */
function classNamed(classes, name) {
    const def = classes.get(name);
    return def ? (0, result_1.ok)(def) : (0, result_1.fail)(`The class ${name} is not defined.`);
}
//# sourceMappingURL=lookup.js.map