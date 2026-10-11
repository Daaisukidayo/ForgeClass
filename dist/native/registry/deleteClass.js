"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$deleteClass",
    version: "1.0.0",
    description: "Deletes a class, returns bool",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("class", "The class name")],
    output: forgescript_1.ArgType.Boolean,
    execute(ctx, [name]) {
        const deleted = ctx.client.classes.delete(name);
        if (!deleted.ok)
            return this.customError(deleted.reason);
        return this.success(deleted.value);
    },
});
//# sourceMappingURL=deleteClass.js.map