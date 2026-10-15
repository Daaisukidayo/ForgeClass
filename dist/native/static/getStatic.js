"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const access_1 = require("../../functions/access");
const lookup_1 = require("../../functions/lookup");
const run_1 = require("../../functions/run");
const value_1 = require("../../functions/value");
exports.default = new forgescript_1.NativeFunction({
    name: "$getStatic",
    version: "1.1.0",
    description: "Returns a static field of a class",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("class", "The class name"), forgescript_1.Arg.requiredString("field", "The static field name")],
    output: forgescript_1.ArgType.Unknown,
    async execute(ctx, [name, field]) {
        const def = (0, lookup_1.classNamed)(ctx.client.classes, name);
        if (!def.ok)
            return this.customError(def.reason);
        const member = ctx.client.classes.staticFieldOf(def.value, field);
        if (!member)
            return this.customError(`${def.value.name} has no static field ${field}.`);
        if (!(0, access_1.canReach)(ctx, member.owner, member.access)) {
            return this.customError((0, access_1.unreachable)(member.owner, field, member.access));
        }
        const rt = await (0, run_1.staticOf)(this, ctx, member.owner, field, member.body);
        if (!rt.success)
            return rt;
        return this.success((0, value_1.toText)(rt.value) ?? null);
    },
});
//# sourceMappingURL=getStatic.js.map