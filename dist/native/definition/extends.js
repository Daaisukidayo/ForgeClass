"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const scope_1 = require("../../functions/scope");
exports.default = new forgescript_1.NativeFunction({
    name: "$extends",
    version: "1.0.0",
    description: "Sets the parent class",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("parent", "The parent class name")],
    execute(ctx, [parent]) {
        const def = ctx[scope_1.BUILDER];
        if (!def)
            return this.customError("$extends can only be used inside $class.");
        const extended = def.extend(parent);
        if (!extended.ok)
            return this.customError(extended.reason);
        return this.success();
    },
});
//# sourceMappingURL=extends.js.map