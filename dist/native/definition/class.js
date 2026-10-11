"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const scope_1 = require("../../functions/scope");
const run_1 = require("../../functions/run");
exports.default = new forgescript_1.NativeFunction({
    name: "$class",
    version: "1.0.0",
    description: "Declares a class",
    unwrap: false,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("name", "The class name"), forgescript_1.Arg.requiredString("body", "The class body")],
    async execute(ctx) {
        const body = this.data.fields[1];
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0);
        if (!this["isValidReturnType"](rt))
            return rt;
        const [name] = args;
        const outer = ctx[scope_1.BUILDER];
        if (outer)
            return this.customError(`${name} can't be declared inside the class ${outer.name}.`);
        if (!name)
            return this.customError("A class needs a name.");
        const def = new __1.ClassDefinition(name);
        let ran;
        ctx[scope_1.BUILDER] = def;
        try {
            ran = await this["resolveCode"](ctx, body);
        }
        finally {
            ctx[scope_1.BUILDER] = undefined;
        }
        const failure = (0, run_1.failureOf)(this, ran, `the body of class ${name}`, false);
        if (failure)
            return failure;
        const defined = ctx.client.classes.define(def);
        if (!defined.ok)
            return this.customError(defined.reason);
        return this.success();
    },
});
//# sourceMappingURL=class.js.map