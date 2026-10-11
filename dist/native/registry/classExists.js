"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$classExists",
    version: "1.0.0",
    description: "Checks whether a class exists, returns bool",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("class", "The class name")],
    output: forgescript_1.ArgType.Boolean,
    execute(ctx, [name]) {
        return this.success(ctx.client.classes.has(name));
    },
});
//# sourceMappingURL=classExists.js.map