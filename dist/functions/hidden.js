"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotOf = void 0;
exports.hiddenField = hiddenField;
exports.hiddenMethod = hiddenMethod;
exports.hasHiddenField = hasHiddenField;
const scope_1 = require("./scope");
const result_1 = require("./result");
// A # member belongs to the class whose method is running, not to the instance's class.
const slotOf = (owner, name) => `${owner.name}${name}`;
exports.slotOf = slotOf;
function runningClass(ctx, name) {
    const frame = ctx[scope_1.FRAME];
    return frame ? (0, result_1.ok)(frame.owner) : (0, result_1.fail)(`${name} can only be used inside the methods of its class.`);
}
/** Returns the class that declares it. */
function hiddenField(ctx, def, name) {
    const owner = runningClass(ctx, name);
    if (!owner.ok)
        return owner;
    if (!owner.value.hiddenFields.has(name))
        return (0, result_1.fail)(`${owner.value.name} has no field ${name}.`);
    return brand(ctx, owner.value, def, name);
}
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
function hasHiddenField(ctx, def, name) {
    const owner = runningClass(ctx, name);
    if (!owner.ok)
        return owner;
    return (0, result_1.ok)(owner.value.hiddenFields.has(name) && ctx.client.classes.isA(def, owner.value.name));
}
function brand(ctx, owner, def, name) {
    return ctx.client.classes.isA(def, owner.name)
        ? (0, result_1.ok)(owner)
        : (0, result_1.fail)(`${name} belongs to ${owner.name}, and this is a ${def.name}.`);
}
//# sourceMappingURL=hidden.js.map