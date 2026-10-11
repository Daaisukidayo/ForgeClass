"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const forgescript_1 = require("@tryforge/forgescript");
const node_test_1 = require("node:test");
const harness_1 = require("./support/harness");
(0, node_test_1.beforeEach)(() => harness_1.bot.ext.classes.clear());
(0, node_test_1.describe)("$param", () => {
    (0, node_test_1.it)("converts an arg to its type", async () => {
        await (0, harness_1.output)("$class[Calc;$method[double;$return[$math[$env[n]*2]];$param[n;Number]]]");
        strict_1.default.equal(await (0, harness_1.output)("$new[c;Calc]$callMethod[c;double;21]"), "42");
    });
    (0, node_test_1.it)("refuses an arg of the wrong type, as ForgeScript does", async () => {
        await (0, harness_1.output)("$class[Calc;$method[double;$return[$math[$env[n]*2]];$param[n;Number]]]");
        strict_1.default.match(await (0, harness_1.failure)("$new[c;Calc]$callMethod[c;double;abc]"), /abc.*for argument.*n.*is not of type.*Number/);
    });
    (0, node_test_1.it)("hands the method what the type gives", async () => {
        await (0, harness_1.output)(`$class[Box;$method[get;$return[$env[data;a]];$param[data;Json]]]`);
        strict_1.default.equal(await (0, harness_1.output)(`$new[b;Box]$callMethod[b;get;{"a":5}]`), "5");
    });
    (0, node_test_1.it)("leaves params without $param as text", async () => {
        await (0, harness_1.output)("$class[M;$method[m;$return[$env[a]/$env[b]];a;$param[b;Number]]]");
        strict_1.default.equal(await (0, harness_1.output)("$new[m;M]$callMethod[m;m;007;007]"), "007/7");
    });
    (0, node_test_1.it)("takes an optional arg, or none", async () => {
        await (0, harness_1.output)("$class[G;$method[greet;$return[Hi$if[$env[name]!=; $env[name]]];$param[name;String;false]]]");
        strict_1.default.equal(await (0, harness_1.output)("$new[g;G]$callMethod[g;greet]|$callMethod[g;greet;Ann]"), "Hi|Hi Ann");
        strict_1.default.match(await (0, harness_1.failure)("$new[g;G]$callMethod[g;greet;a;b]"), /G\.greet takes at most 1 argument, got 2/);
    });
    (0, node_test_1.it)("gathers the rest into an array", async () => {
        await (0, harness_1.output)("$class[R;" +
            "$method[nums;$return[$env[nums]];$param[nums;Number;true;true]]" +
            "$method[tags;$return[$env[tags]];$param[tags;String;false;true]]]");
        strict_1.default.deepEqual(await (0, harness_1.json)("$new[r;R]$callMethod[r;nums;1;2;3]"), [1, 2, 3]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$new[r;R]$callMethod[r;tags]"), []);
        strict_1.default.match(await (0, harness_1.failure)("$new[r;R]$callMethod[r;nums]"), /R\.nums takes at least 1 argument, got 0/);
    });
    (0, node_test_1.it)("types the constructor's params too", async () => {
        await (0, harness_1.output)("$class[P;$field[age]$constructor[$setField[this;age;$env[age]];$param[age;Number]]]");
        strict_1.default.equal(await (0, harness_1.output)("$new[p;P;5]$getField[p;age]"), "5");
        strict_1.default.match(await (0, harness_1.failure)("$new[p;P;old]"), /old.*for argument.*age.*is not of type.*Number/);
    });
    for (const code of [
        "$param[x;Number]",
        "$class[A;$param[x;Number]]",
        "$class[A;$method[m;$param[x;Number]]]$new[a;A]$callMethod[a;m]",
    ]) {
        (0, node_test_1.it)(`is refused outside the params: ${code}`, async () => {
            strict_1.default.match(await (0, harness_1.failure)(code), /\$param can only be used in the params of \$method or \$constructor/);
        });
    }
    (0, node_test_1.it)("refuses a type that doesn't exist, and Enum", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$class[A;$method[m;1;$param[x;Numbr]]]"), /Numbr.*is not of type.*Enum/);
        strict_1.default.match(await (0, harness_1.failure)("$class[A;$method[m;1;$param[x;Enum]]]"), /can't be an Enum/);
    });
    (0, node_test_1.it)("refuses a rest param before the last, and a required one after an optional", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$class[A;$method[m;1;$param[a;String;true;true];b]]"), /Only the last param can be rest, not a/);
        strict_1.default.match(await (0, harness_1.failure)("$class[A;$method[m;1;$param[a;Number;false];b]]"), /The required param b can't come after an optional one/);
    });
});
(0, node_test_1.describe)("typed params in class files", () => {
    (0, node_test_1.it)("are written as in ForgeScript's own functions", async () => {
        harness_1.bot.ext.classes.add({
            name: "Calc",
            methods: {
                double: { params: [{ name: "n", type: "Number" }], code: "$return[$math[$env[n]*2]]" },
                mix: {
                    params: ["a", { name: "b", type: forgescript_1.ArgType.Number, required: false }],
                    code: "$return[$env[a]/$env[b]]",
                },
            },
        });
        strict_1.default.equal(await (0, harness_1.output)("$new[c;Calc]$callMethod[c;double;21]"), "42");
        strict_1.default.equal(await (0, harness_1.output)("$new[c;Calc]$callMethod[c;mix;x]|$callMethod[c;mix;x;3]"), "x/|x/3");
    });
    (0, node_test_1.it)("refuse a type that doesn't exist", () => {
        strict_1.default.throws(() => harness_1.bot.ext.classes.add({
            name: "A",
            methods: { m: { params: [{ name: "n", type: "Numbr" }], code: "1" } },
        }), /"Numbr" is not a type, in param n/);
    });
});
//# sourceMappingURL=params.test.js.map