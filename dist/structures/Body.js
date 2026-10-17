"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Body = void 0;
const forgescript_1 = require("@tryforge/forgescript");
const value_1 = require("../functions/value");
/** The code of a field default or method, compiled on first use. */
class Body {
    source;
    compiled;
    /** @param source Compiled code, text from a class file, or what compiles it. */
    constructor(source) {
        this.source = source;
    }
    /** A field default from a class file. Its strings are code wherever they are, the rest is kept as it is. */
    static of(value) {
        return new Body(typeof value === "string" ? value : () => compileValue(value));
    }
    /** The compiled code. Throws when the text doesn't compile. */
    get code() {
        if (typeof this.source === "object")
            return this.source;
        return (this.compiled ??= typeof this.source === "string" ? forgescript_1.Compiler.compile(this.source) : this.source());
    }
}
exports.Body = Body;
/** One piece of code for every string in the value. It gives the value as JSON, each string replaced by its output. */
function compileValue(value) {
    const parts = [];
    const build = planOf(value, parts);
    return {
        functions: parts.flatMap((part) => part.functions),
        resolve: (args) => {
            let at = 0;
            const outputs = parts.map((part) => {
                const own = args.slice(at, at + part.functions.length);
                at += part.functions.length;
                return part.resolve(own);
            });
            return (0, value_1.stringify)(build(outputs));
        },
    };
}
/** What builds the value from the outputs of its strings, each compiled into `parts`. */
function planOf(value, parts) {
    if (typeof value === "string") {
        const at = parts.push(forgescript_1.Compiler.compile(value)) - 1;
        return (outputs) => (0, value_1.parseValue)(outputs[at]);
    }
    if (Array.isArray(value)) {
        const items = value.map((item) => planOf(item, parts));
        return (outputs) => items.map((item) => item(outputs));
    }
    if (value !== null && typeof value === "object") {
        const entries = Object.entries(value).map(([key, item]) => [key, planOf(item, parts)]);
        return (outputs) => Object.fromEntries(entries.map(([key, item]) => [key, item(outputs)]));
    }
    return () => value;
}
//# sourceMappingURL=Body.js.map