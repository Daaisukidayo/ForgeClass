"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalRest = optionalRest;
const forgescript_1 = require("@tryforge/forgescript");
/** ForgeScript 2.3.0's Arg.restString makes every rest argument required. */
function optionalRest(name, desc) {
    return { ...forgescript_1.Arg.restString(name, desc), required: false };
}
//# sourceMappingURL=args.js.map