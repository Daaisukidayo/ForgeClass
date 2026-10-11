"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const args_1 = require("../../functions/args");
const keys_1 = require("../../functions/keys");
const lookup_1 = require("../../functions/lookup");
const run_1 = require("../../functions/run");
exports.default = new forgescript_1.NativeFunction({
    name: "$new",
    version: "1.0.0",
    description: "Creates an instance of a class",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The variable to store it in"),
        forgescript_1.Arg.requiredString("class", "The class name"),
        (0, args_1.optionalRest)("args", "The constructor args"),
    ],
    async execute(ctx, [variable, name, args]) {
        const checked = (0, keys_1.checkName)(variable, "a variable name");
        if (!checked.ok)
            return this.customError(checked.reason);
        if (variable === "this")
            return this.customError(`"this" is the instance a method runs on, pick another name.`);
        const classes = ctx.client.classes;
        const def = (0, lookup_1.classNamed)(classes, name);
        if (!def.ok)
            return this.customError(def.reason);
        const built = await (0, run_1.construct)(this, ctx, def.value, args);
        if (!built.success)
            return built;
        ctx.setEnvironmentKey(variable, built.value);
        return this.success();
    },
});
//# sourceMappingURL=new.js.map