"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
exports.default = new forgescript_1.NativeFunction({
    name: "$className",
    version: "1.0.0",
    description: "Returns the class name of an instance",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("variable", "The instance variable")],
    output: forgescript_1.ArgType.String,
    execute(ctx, [variable]) {
        const value = ctx.getEnvironmentKey(variable);
        if (!(0, __1.isInstance)(value))
            return this.customError(`"${variable}" does not hold a class instance.`);
        return this.success(value[__1.CLASS_KEY]);
    },
});
//# sourceMappingURL=className.js.map