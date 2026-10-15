"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const access_1 = require("../../functions/access");
const args_1 = require("../../functions/args");
const lookup_1 = require("../../functions/lookup");
const run_1 = require("../../functions/run");
exports.default = new forgescript_1.NativeFunction({
    name: "$callStatic",
    version: "1.1.0",
    description: "Calls a static method of a class",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("class", "The class name"),
        forgescript_1.Arg.requiredString("method", "The static method name"),
        (0, args_1.optionalRest)("args", "The method args"),
    ],
    output: forgescript_1.ArgType.Unknown,
    async execute(ctx, [name, method, args]) {
        const classes = ctx.client.classes;
        const def = (0, lookup_1.classNamed)(classes, name);
        if (!def.ok)
            return this.customError(def.reason);
        const member = classes.staticMethodOf(def.value, method);
        if (!member) {
            return this.customError(classes.findMethod(def.value, method)
                ? `${def.value.name}.${method} isn't static, call it on an instance with $callMethod.`
                : `${def.value.name} has no static method ${method}.`);
        }
        if (!(0, access_1.canReach)(ctx, member.owner, member.access)) {
            return this.customError((0, access_1.unreachable)(member.owner, method, member.access));
        }
        const rt = await (0, run_1.runMethod)(this, ctx, null, member, args);
        if (!rt.success)
            return rt;
        return this.success(rt.value);
    },
});
//# sourceMappingURL=callStatic.js.map