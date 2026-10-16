"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotOf = void 0;
exports.hiddenField = hiddenField;
exports.hiddenMethod = hiddenMethod;
exports.hasHiddenField = hasHiddenField;
exports.hasHiddenMethod = hasHiddenMethod;
const scope_1 = require("./scope");
const result_1 = require("./result");
// A # member belongs to the class whose method is running, not to the instance's class.
/** Where a `#` field is kept in `ClassManager.hiddenOf`. */
const slotOf = (owner, name) => `${owner.name}${name}`;
exports.slotOf = slotOf;
/** The class whose code is running. Fails outside class code. */
function runningClass(ctx, name) {
    const frame = ctx[scope_1.FRAME];
    return frame ? (0, result_1.ok)(frame.owner) : (0, result_1.fail)(`${name} can only be used inside the methods of its class.`);
}
/** Checks that the running class has the `#` field and the instance is of it. Succeeds with that class. */
function hiddenField(ctx, def, name) {
    const owner = runningClass(ctx, name);
    if (!owner.ok)
        return owner;
    if (!owner.value.hiddenFields.has(name))
        return (0, result_1.fail)(`${owner.value.name} has no field ${name}.`);
    return brand(ctx, owner.value, def, name);
}
/** A `#` method of the running class, when the instance is of it. */
function hiddenMethod(ctx, def, name) {
    const owner = runningClass(ctx, name);
    if (!owner.ok)
        return owner;
    const method = owner.value.hiddenMethods.get(name);
    if (!method)
        return (0, result_1.fail)(`${owner.value.name} has no method ${name}.`);
    const branded = brand(ctx, owner.value, def, name);
    return branded.ok ? (0, result_1.ok)({ ...method, name, owner: owner.value }) : branded;
}
/** Whether the running class has the `#` field and the instance is of it. */
function hasHiddenField(ctx, def, name) {
    const owner = runningClass(ctx, name);
    if (!owner.ok)
        return owner;
    return (0, result_1.ok)(owner.value.hiddenFields.has(name) && ctx.client.classes.isA(def, owner.value.name));
}
/** Whether the running class has the `#` method and the instance is of it. */
function hasHiddenMethod(ctx, def, name) {
    const owner = runningClass(ctx, name);
    if (!owner.ok)
        return owner;
    return (0, result_1.ok)(owner.value.hiddenMethods.has(name) && ctx.client.classes.isA(def, owner.value.name));
}
/** Fails unless the instance's class is the owner or extends it. */
function brand(ctx, owner, def, name) {
    return ctx.client.classes.isA(def, owner.name)
        ? (0, result_1.ok)(owner)
        : (0, result_1.fail)(`${name} belongs to ${owner.name}, and this is a ${def.name}.`);
}
//# sourceMappingURL=hidden.js.map