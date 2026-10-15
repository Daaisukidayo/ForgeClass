"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unreachable = void 0;
exports.canReach = canReach;
exports.canWrite = canWrite;
const structures_1 = require("../structures");
const scope_1 = require("./scope");
/** Private reaches from the declaring class only, protected from it and its children too. */
function canReach(ctx, owner, access) {
    if (access === "public")
        return true;
    const running = ctx[scope_1.FRAME]?.owner;
    if (!running)
        return false;
    return access === "private" ? running.name === owner.name : ctx.client.classes.isA(running, owner.name);
}
const unreachable = (owner, name, access) => `${owner.name}.${name} is ${access}.`;
exports.unreachable = unreachable;
/** Readonly fields are set by their defaults, or in the constructor of the same instance. */
function canWrite(ctx, instance) {
    const frame = ctx[scope_1.FRAME];
    return frame?.method === structures_1.CONSTRUCTOR && frame.instance === instance;
}
//# sourceMappingURL=access.js.map