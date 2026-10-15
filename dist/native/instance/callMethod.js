"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
const access_1 = require("../../functions/access");
const args_1 = require("../../functions/args");
const hidden_1 = require("../../functions/hidden");
const lookup_1 = require("../../functions/lookup");
const run_1 = require("../../functions/run");
exports.default = new forgescript_1.NativeFunction({
    name: "$callMethod",
    version: "1.0.0",
    description: "Calls a method of an instance",
    unwrap: true,
    brackets: true,
    args: [
        forgescript_1.Arg.requiredString("variable", "The instance variable"),
        forgescript_1.Arg.requiredString("method", "The method name"),
        (0, args_1.optionalRest)("args", "The method args"),
    ],
    output: forgescript_1.ArgType.Unknown,
    async execute(ctx, [variable, name, args]) {
        const classes = ctx.client.classes;
        const found = (0, lookup_1.instanceIn)(ctx, variable);
        if (!found.ok)
            return this.customError(found.reason);
        const { instance, def } = found.value;
        if (name === __1.CONSTRUCTOR) {
            return this.customError("The constructor runs from $new, or from a child's constructor through $super.");
        }
        let method;
        if ((0, __1.isHidden)(name)) {
            const found = (0, hidden_1.hiddenMethod)(ctx, def, name);
            if (!found.ok)
                return this.customError(found.reason);
            method = found.value;
        }
        else {
            method = classes.findMethod(def, name);
            if (!method) {
                return this.customError(classes.staticMethodOf(def, name)
                    ? `${def.name}.${name} is static, call it with $callStatic.`
                    : `${def.name} has no method ${name}.`);
            }
            if (!(0, access_1.canReach)(ctx, method.owner, method.access)) {
                return this.customError((0, access_1.unreachable)(method.owner, name, method.access));
            }
        }
        const rt = await (0, run_1.runMethod)(this, ctx, instance, method, args);
        if (!rt.success)
            return rt;
        return this.success(rt.value);
    },
});
//# sourceMappingURL=callMethod.js.map