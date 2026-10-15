"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDeclaration = parseDeclaration;
const result_1 = require("./result");
const WORDS = new Set(["public", "protected", "private", "static", "readonly"]);
const ACCESS = new Set(["public", "protected", "private"]);
/** Splits `private readonly hp` into the name and its modifiers. */
function parseDeclaration(text, kind) {
    const words = text.trim().split(/\s+/);
    const name = words.pop() ?? "";
    if (!name)
        return (0, result_1.fail)(`A ${kind} has no name.`);
    const used = new Set();
    for (const word of words) {
        if (!WORDS.has(word)) {
            return (0, result_1.fail)(`"${word}" is not a modifier of ${name}. Use public, protected, private, static or readonly.`);
        }
        if (used.has(word))
            return (0, result_1.fail)(`${name} has "${word}" twice.`);
        used.add(word);
    }
    const access = [...used].filter((word) => ACCESS.has(word));
    if (name === "#")
        return (0, result_1.fail)(`A # ${kind} needs a name after the #.`);
    if (name === "#constructor")
        return (0, result_1.fail)(`"#constructor" can't be a name.`);
    if (access.length > 1)
        return (0, result_1.fail)(`${name} can't be both ${access[0]} and ${access[1]}.`);
    if (name.startsWith("#") && access.length)
        return (0, result_1.fail)(`${name} is private through its #, so it can't be ${access[0]}.`);
    if (kind === "method" && used.has("readonly"))
        return (0, result_1.fail)(`The method ${name} can't be readonly.`);
    if (name === "constructor" && used.size)
        return (0, result_1.fail)("The constructor takes no modifiers.");
    return (0, result_1.ok)({
        name,
        access: access[0] ?? (name.startsWith("#") ? "private" : "public"),
        static: used.has("static"),
        readonly: used.has("readonly"),
    });
}
//# sourceMappingURL=declaration.js.map