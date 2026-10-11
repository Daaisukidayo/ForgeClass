"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
exports.default = new forgescript_1.NativeFunction({
    name: "$instanceOf",
    version: "1.0.0",
    description: "Checks whether a variable holds an instance of a class, returns bool",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("variable", "The variable to check"), forgescript_1.Arg.requiredString("class", "The class name")],
    output: forgescript_1.ArgType.Boolean,
    execute(ctx, [variable, name]) {
        const value = ctx.getEnvironmentKey(variable);
        if (!(0, __1.isInstance)(value))
            return this.success(false);
        const classes = ctx.client.classes;
        const def = classes.get(value[__1.CLASS_KEY]);
        return this.success(def !== null && classes.isA(def, name));
    },
});
//# sourceMappingURL=instanceOf.js.map