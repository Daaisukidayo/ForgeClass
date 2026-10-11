"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Body = void 0;
const forgescript_1 = require("@tryforge/forgescript");
class Body {
    source;
    compiled;
    constructor(source) {
        this.source = source;
    }
    get code() {
        if (typeof this.source !== "string")
            return this.source;
        return (this.compiled ??= forgescript_1.Compiler.compile(this.source));
    }
}
exports.Body = Body;
//# sourceMappingURL=Body.js.map