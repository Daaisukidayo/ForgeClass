"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.done = exports.fail = exports.ok = void 0;
const ok = (value) => ({ ok: true, value });
exports.ok = ok;
const fail = (reason) => ({ ok: false, reason });
exports.fail = fail;
exports.done = (0, exports.ok)(undefined);
//# sourceMappingURL=result.js.map