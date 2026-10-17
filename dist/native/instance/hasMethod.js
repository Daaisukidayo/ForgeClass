"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const access_1 = require("../../functions/access");
const hidden_1 = require("../../functions/hidden");
const lookup_1 = require("../../functions/lookup");
exports.default = new forgescript_1.NativeFunction({
    name: "$hasMethod",
    version: "1.2.0",
    description: "Checks whether an instance has a method, returns bool",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("variable", "The instance variable"), forgescript_1.Arg.requiredString("method", "The method name")],
    output: forgescript_1.ArgType.Boolean,
    execute(ctx, [variable, method]) {
        const classes = ctx.client.classes;
        const found = (0, lookup_1.instanceIn)(ctx, variable);
        if (!found.ok)
            return this.customError(found.reason);
        const { def } = found.value;
        if ((0, __1.isHidden)(method)) {
            const has = (0, hidden_1.hasHiddenMethod)(ctx, def, method);
            return has.ok ? this.success(has.value) : this.customError(has.reason);
        }
        const member = method === __1.CONSTRUCTOR ? null : classes.findMethod(def, method);
        return this.success(member !== null && (0, access_1.canReach)(ctx, member.owner, member.access));
    },
});
//# sourceMappingURL=hasMethod.js.map