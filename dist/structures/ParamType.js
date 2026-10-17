"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParamType = void 0;
const forgescript_1 = require("@tryforge/forgescript");
/** The types a param can have: ForgeScript's arg types without Enum, which has no values to pick from. */
exports.ParamType = Object.fromEntries(
// the value check drops Enum's reverse mapping, from its number to its name
Object.entries(forgescript_1.ArgType).filter(([key, value]) => key !== "Enum" && value !== "Enum"));
//# sourceMappingURL=ParamType.js.map