"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const lookup_1 = require("../../functions/lookup");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$classFields",
    version: "1.0.0",
    description: "Returns the fields of a class as JSON",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("class", "The class name")],
    output: forgescript_1.ArgType.Json,
    execute(ctx, [name]) {
        const classes = ctx.client.classes;
        const def = (0, lookup_1.classNamed)(classes, name);
        if (!def.ok)
            return this.customError(def.reason);
        const fields = [...classes.fieldsOf(def.value)].filter(([, field]) => field.access === "public");
        return this.success((0, value_1.stringify)(fields.map(([name]) => name)));
    },
});
//# sourceMappingURL=classFields.js.map