"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const lookup_1 = require("../../functions/lookup");
exports.default = new forgescript_1.NativeFunction({
    name: "$classParent",
    version: "1.0.0",
    description: "Returns the parent class name",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("class", "The class name")],
    output: forgescript_1.ArgType.String,
    execute(ctx, [name]) {
        const def = (0, lookup_1.classNamed)(ctx.client.classes, name);
        if (!def.ok)
            return this.customError(def.reason);
        return this.success(def.value.parent);
    },
});
//# sourceMappingURL=classParent.js.map