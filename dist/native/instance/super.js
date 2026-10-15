"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const access_1 = require("../../functions/access");
const args_1 = require("../../functions/args");
const scope_1 = require("../../functions/scope");
const run_1 = require("../../functions/run");
exports.default = new forgescript_1.NativeFunction({
    name: "$super",
    version: "1.0.0",
    description: "Calls a parent class method",
    unwrap: true,
    brackets: true,
    args: [forgescript_1.Arg.requiredString("method", "The method name"), (0, args_1.optionalRest)("args", "The method args")],
    output: forgescript_1.ArgType.Unknown,
    async execute(ctx, [name, args]) {
        const frame = ctx[scope_1.FRAME];
        if (!frame)
            return this.customError(`${this.fn.name} can only be used inside a method.`);
        const { owner, instance, method: running } = frame;
        if (owner.parent === null)
            return this.customError(`${owner.name} has no parent class.`);
        // anywhere else, it could set readonly fields again
        if (name === __1.CONSTRUCTOR && running !== __1.CONSTRUCTOR) {
            return this.customError(`${this.fn.name}[constructor] can only be used in a constructor.`);
        }
        const classes = ctx.client.classes;
        const parent = classes.get(owner.parent);
        if (!parent)
            return this.customError(`${owner.name} extends ${owner.parent}, which is not defined.`);
        const method = instance ? classes.findMethod(parent, name) : classes.staticMethodOf(parent, name);
        if (!method) {
            const missing = name === __1.CONSTRUCTOR ? "constructor" : `${instance ? "" : "static "}method ${name}`;
            return this.customError(`${parent.name} has no ${missing}.`);
        }
        if (!(0, access_1.canReach)(ctx, method.owner, method.access)) {
            return this.customError((0, access_1.unreachable)(method.owner, name, method.access));
        }
        const rt = await (0, run_1.runMethod)(this, ctx, instance, method, args);
        if (!rt.success)
            return rt;
        return this.success(rt.value);
    },
});
//# sourceMappingURL=super.js.map