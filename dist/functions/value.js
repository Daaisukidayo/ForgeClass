"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.looksLikeJSON = looksLikeJSON;
exports.parseJSON = parseJSON;
exports.parseValue = parseValue;
exports.parseScalar = parseScalar;
exports.stringify = stringify;
exports.toText = toText;
const result_1 = require("./result");
const JSON_START = /^\s*[[{]/;
const LONG_DIGITS = /\d{16,}/;
const INTEGER = /^-?\d+$/;
function looksLikeJSON(text) {
    return JSON_START.test(text);
}
function parseJSON(text) {
    try {
        const value = JSON.parse(text);
        return (0, result_1.ok)(LONG_DIGITS.test(text) && hasUnsafeInteger(value) ? JSON.parse(text, keepLongIntegers) : value);
    }
    catch (err) {
        return (0, result_1.fail)(err instanceof Error ? err.message : String(err));
    }
}
function hasUnsafeInteger(value) {
    if (typeof value === "number")
        return Number.isInteger(value) && !Number.isSafeInteger(value);
    return typeof value === "object" && value !== null && Object.values(value).some(hasUnsafeInteger);
}
function keepLongIntegers(_key, value, context) {
    if (typeof value === "number" && !Number.isSafeInteger(value) && context?.source && INTEGER.test(context.source)) {
        return context.source;
    }
    return value;
}
/** IDs and other numbers that wouldn't read back the same stay text. */
function parseValue(text) {
    if (text === "null")
        return null;
    if (looksLikeJSON(text)) {
        const parsed = parseJSON(text);
        if (parsed.ok)
            return parsed.value;
    }
    return parseScalar(text);
}
function parseScalar(text) {
    if (text.length > 1 && text.startsWith('"') && text.endsWith('"')) {
        const parsed = parseJSON(text);
        return parsed.ok && typeof parsed.value === "string" ? parsed.value : text.slice(1, -1);
    }
    if (text === "true")
        return true;
    if (text === "false")
        return false;
    const number = Number(text);
    if (Number.isFinite(number) && String(number) === text)
        return number;
    return text;
}
function stringify(value, indent) {
    return JSON.stringify(value, (_key, item) => (typeof item === "bigint" ? item.toString() : item), indent);
}
function toText(value) {
    if (value === undefined)
        return undefined;
    if (typeof value === "string")
        return value;
    if (typeof value === "object")
        return stringify(value);
    return String(value);
}
//# sourceMappingURL=value.js.map