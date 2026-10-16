"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.done = exports.fail = exports.ok = void 0;
/** A success with a value. */
const ok = (value) => ({ ok: true, value });
exports.ok = ok;
/** A failure with its reason. */
const fail = (reason) => ({ ok: false, reason });
exports.fail = fail;
/** A success with no value. */
exports.done = (0, exports.ok)(undefined);
//# sourceMappingURL=result.js.map