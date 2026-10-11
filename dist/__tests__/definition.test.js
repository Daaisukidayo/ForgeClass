"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const harness_1 = require("./support/harness");
(0, node_test_1.beforeEach)(() => harness_1.bot.ext.classes.clear());
(0, node_test_1.describe)("$class", () => {
    (0, node_test_1.it)("registers a class with its fields and methods", async () => {
        await (0, harness_1.output)("$class[Player;$field[name]$field[hp;100]$constructor[$setField[this;name;$env[name]];name]$method[heal;ok]]");
        strict_1.default.equal(await (0, harness_1.output)("$classExists[Player]"), "true");
        strict_1.default.deepEqual(await (0, harness_1.json)("$classFields[Player]"), ["name", "hp"]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$classMethods[Player]"), ["heal"], "the constructor is not a method to call");
        strict_1.default.equal(await (0, harness_1.output)("$classParent[Player]"), "");
    });
    (0, node_test_1.it)("outputs nothing of its body", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$class[A;text $field[x] more]after"), "after");
    });
    (0, node_test_1.it)("replaces a class declared again under the same name", async () => {
        await (0, harness_1.output)("$class[A;$field[x]]$class[A;$field[y]]");
        strict_1.default.deepEqual(await (0, harness_1.json)("$classFields[A]"), ["y"]);
    });
    for (const fn of ["$field[x]", "$method[m;code]", "$constructor[code]", "$extends[A]"]) {
        (0, node_test_1.it)(`refuses ${fn} outside $class`, async () => {
            strict_1.default.match(await (0, harness_1.failure)(fn), /can only be used inside \$class/);
        });
    }
    (0, node_test_1.it)("refuses a class inside a class", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$class[A;$class[B;$field[x]]]"), /B can't be declared inside the class A/);
        strict_1.default.equal(await (0, harness_1.output)("$classExists[A]"), "false");
    });
    (0, node_test_1.it)("refuses $return in the class body", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$class[A;$return[x]]"), /\$return can't be used in the body of class A/);
    });
});
(0, node_test_1.describe)("a class that can't be used", () => {
    const cases = [
        ["a field declared twice", "$field[x]$field[x]", /A\.x is declared twice/],
        ["a method declared twice", "$method[m;1]$method[m;2]", /A\.m is declared twice/],
        ["two constructors", "$constructor[1]$constructor[2]", /A's constructor is declared twice/],
        ["a constructor through $method", "$method[constructor;1]", /declared with \$constructor/],
        ["a field named __class", "$field[__class]", /holds the class name/],
        ["a field leading to the prototype", "$field[__proto__]", /leads to the prototype/],
        ["a parameter named this", "$method[m;1;this]", /"this" is the instance/],
        ["a parameter named twice", "$method[m;1;a;a]", /two parameters named "a"/],
        ["a parent that isn't defined", "$extends[Nope]", /A extends Nope, which is not defined/],
        ["a class extending itself", "$extends[A]", /A can't extend itself/],
        ["two parents", "$extends[B]$extends[C]", /A already extends B/],
    ];
    for (const [what, body, reason] of cases) {
        (0, node_test_1.it)(`is refused for ${what}, and not registered`, async () => {
            await (0, harness_1.output)("$class[B;$field[b]]$class[C;$field[c]]");
            strict_1.default.match(await (0, harness_1.failure)(`$class[A;${body}]`), reason);
            strict_1.default.equal(await (0, harness_1.output)("$classExists[A]"), "false");
        });
    }
    (0, node_test_1.it)("keeps the old class when the new one would close a circle", async () => {
        await (0, harness_1.output)("$class[A;$field[a]]$class[B;$extends[A]]");
        strict_1.default.match(await (0, harness_1.failure)("$class[A;$extends[B]]"), /A → B → A: these classes extend each other in a circle/);
        strict_1.default.equal(await (0, harness_1.output)("$classParent[A]"), "");
        strict_1.default.deepEqual(await (0, harness_1.json)("$classFields[A]"), ["a"]);
    });
});
//# sourceMappingURL=definition.test.js.map