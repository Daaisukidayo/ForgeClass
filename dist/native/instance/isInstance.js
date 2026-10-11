"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
exports.default = new forgescript_1.NativeFunction({
    name: "$isInstance",
    version: "1.0.0",
    description: "Checks whether a variable holds an instance, returns bool",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("variable", "The variable to check")],
    output: forgescript_1.ArgType.Boolean,
    execute(ctx, [variable]) {
        return this.success((0, __1.isInstance)(ctx.getEnvironmentKey(variable)));
    },
});
//# sourceMappingURL=isInstance.js.map