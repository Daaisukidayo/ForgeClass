"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unreachable = void 0;
exports.canReach = canReach;
exports.canWrite = canWrite;
const structures_1 = require("../structures");
const scope_1 = require("./scope");
/** Whether the running code reaches the member: private from its class only, protected from its children too. */
function canReach(ctx, owner, access) {
    if (access === "public")
        return true;
    const running = ctx[scope_1.FRAME]?.owner;
    if (!running)
        return false;
    return access === "private" ? running.name === owner.name : ctx.client.classes.isA(running, owner.name);
}
/** The error for a member out of reach. */
const unreachable = (owner, name, access) => `${owner.name}.${name} is ${access}.`;
exports.unreachable = unreachable;
/** Whether readonly fields of the instance can be set here. Only its constructor can, besides the defaults. */
function canWrite(ctx, instance) {
    const frame = ctx[scope_1.FRAME];
    return frame?.method === structures_1.CONSTRUCTOR && frame.instance === instance;
}
//# sourceMappingURL=access.js.map