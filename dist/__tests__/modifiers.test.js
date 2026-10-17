"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const declaration_1 = require("../functions/declaration");
const harness_1 = require("./support/harness");
(0, node_test_1.beforeEach)(() => harness_1.bot.ext.classes.clear());
(0, node_test_1.describe)("parseDeclaration", () => {
    (0, node_test_1.it)("reads the modifiers before the name", () => {
        strict_1.default.deepEqual((0, declaration_1.parseDeclaration)("private readonly id", "field"), {
            ok: true,
            value: { name: "id", access: "private", static: false, readonly: true },
        });
        strict_1.default.deepEqual((0, declaration_1.parseDeclaration)("static protected count", "field"), {
            ok: true,
            value: { name: "count", access: "protected", static: true, readonly: false },
        });
        strict_1.default.deepEqual((0, declaration_1.parseDeclaration)("#token", "field"), {
            ok: true,
            value: { name: "#token", access: "private", static: false, readonly: false },
        });
    });
    for (const [text, kind, reason] of [
        ["privat hp", "field", /"privat" is not a modifier of hp/],
        ["public private hp", "field", /can't be both public and private/],
        ["static static n", "field", /n has "static" twice/],
        ["protected #x", "field", /#x is private through its #/],
        ["readonly run", "method", /The method run can't be readonly/],
        ["static constructor", "method", /The constructor takes no modifiers/],
    ]) {
        (0, node_test_1.it)(`refuses "${text}"`, () => {
            const parsed = (0, declaration_1.parseDeclaration)(text, kind);
            strict_1.default.equal(parsed.ok, false);
            if (!parsed.ok)
                strict_1.default.match(parsed.reason, reason);
        });
    }
});
const ACCOUNT = "$class[Account;" +
    "$field[private balance;0]" +
    "$field[protected owner]" +
    "$field[readonly id;7]" +
    "$constructor[$setField[this;owner;$env[owner]];owner]" +
    "$method[private log;$return[logged]]" +
    "$method[deposit;$setField[this;balance;$math[$getField[this;balance]+$env[n]]]$return[$getField[this;balance]];n]" +
    "$method[audit;$return[$callMethod[this;log]]]" +
    "$method[fields;$return[$instanceFields[this]]]" +
    "$method[rename;$setField[this;id;8]]" +
    "]";
(0, node_test_1.describe)("private and protected", () => {
    (0, node_test_1.beforeEach)(() => (0, harness_1.output)(ACCOUNT));
    (0, node_test_1.it)("keep private members to their class", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$new[a;Account;Ann]$callMethod[a;deposit;5]|$callMethod[a;audit]"), "5|logged");
        strict_1.default.match(await (0, harness_1.failure)("$new[a;Account;Ann]$getField[a;balance]"), /Account\.balance is private/);
        strict_1.default.match(await (0, harness_1.failure)("$new[a;Account;Ann]$setField[a;balance;9]"), /Account\.balance is private/);
        strict_1.default.match(await (0, harness_1.failure)("$new[a;Account;Ann]$callMethod[a;log]"), /Account\.log is private/);
    });
    (0, node_test_1.it)("let a child reach protected members, but not private ones", async () => {
        await (0, harness_1.output)("$class[Savings;$extends[Account]$method[who;$return[$getField[this;owner]]]$method[peek;$return[$getField[this;balance]]]]");
        strict_1.default.equal(await (0, harness_1.output)("$new[s;Savings;Ann]$callMethod[s;who]"), "Ann");
        strict_1.default.match(await (0, harness_1.failure)("$new[s;Savings;Ann]$callMethod[s;peek]"), /Account\.balance is private/);
        strict_1.default.match(await (0, harness_1.failure)("$new[a;Account;Ann]$getField[a;owner]"), /Account\.owner is protected/);
    });
    (0, node_test_1.it)("hide what can't be reached from the lists", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$new[a;Account;Ann]$instanceFields[a]"), { id: 7 });
        strict_1.default.deepEqual(await (0, harness_1.json)("$new[a;Account;Ann]$callMethod[a;fields]"), { balance: 0, owner: "Ann", id: 7 });
        strict_1.default.deepEqual(await (0, harness_1.json)("$classFields[Account]"), ["id"]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$classMethods[Account]"), ["deposit", "audit", "fields", "rename"]);
        strict_1.default.equal(await (0, harness_1.output)("$new[a;Account;Ann]$hasField[a;balance]|$hasField[a;id]"), "false|true");
        strict_1.default.equal(await (0, harness_1.output)("$new[a;Account;Ann]$hasMethod[a;log]|$hasMethod[a;audit]"), "false|true");
    });
});
(0, node_test_1.describe)("readonly", () => {
    (0, node_test_1.beforeEach)(() => (0, harness_1.output)(ACCOUNT));
    (0, node_test_1.it)("is set by a default or the constructor, and nowhere else", async () => {
        await (0, harness_1.output)("$class[Tag;$field[readonly v]$constructor[$setField[this;v;$env[v]];v]]");
        strict_1.default.equal(await (0, harness_1.output)("$new[t;Tag;x]$getField[t;v]"), "x");
        strict_1.default.match(await (0, harness_1.failure)("$new[a;Account;Ann]$setField[a;id;8]"), /Account\.id is readonly/);
        strict_1.default.match(await (0, harness_1.failure)("$new[a;Account;Ann]$callMethod[a;rename]"), /Account\.id is readonly/);
    });
    (0, node_test_1.it)("keeps $super[constructor] to constructors", async () => {
        await (0, harness_1.output)("$class[P;$constructor[1]]$class[C;$extends[P]$method[m;$super[constructor]]]");
        strict_1.default.match(await (0, harness_1.failure)("$new[c;C]$callMethod[c;m]"), /\[constructor\] can only be used in a constructor/);
    });
});
(0, node_test_1.describe)("static", () => {
    (0, node_test_1.beforeEach)(() => (0, harness_1.output)("$class[Counter;" +
        "$field[static count;0]" +
        "$field[static readonly MAX;3]" +
        "$field[private static secret;s]" +
        "$method[static bump;$setStatic[Counter;count;$math[$getStatic[Counter;count]+1]]$return[$getStatic[Counter;count]]]" +
        "$method[static peek;$return[$getStatic[Counter;secret]]]" +
        "$method[static who;$return[$isInstance[this]]]]"));
    (0, node_test_1.it)("keeps one value for the class, across commands", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$callStatic[Counter;bump]|$callStatic[Counter;bump]"), "1|2");
        strict_1.default.equal(await (0, harness_1.output)("$getStatic[Counter;count]"), "2");
    });
    (0, node_test_1.it)("refuses to change a readonly one, and keeps private ones in", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$setStatic[Counter;MAX;5]"), /Counter\.MAX is readonly/);
        strict_1.default.equal(await (0, harness_1.output)("$getStatic[Counter;MAX]"), "3");
        strict_1.default.match(await (0, harness_1.failure)("$getStatic[Counter;secret]"), /Counter\.secret is private/);
        strict_1.default.equal(await (0, harness_1.output)("$callStatic[Counter;peek]"), "s");
    });
    (0, node_test_1.it)("has no this, and isn't mixed up with instance methods", async () => {
        await (0, harness_1.output)(ACCOUNT);
        strict_1.default.equal(await (0, harness_1.output)("$callStatic[Counter;who]"), "false");
        strict_1.default.match(await (0, harness_1.failure)("$new[c;Counter]$callMethod[c;bump]"), /is static, call it with \$callStatic/);
        strict_1.default.equal(await (0, harness_1.output)("$new[c;Counter]$hasMethod[c;bump]"), "false");
        strict_1.default.match(await (0, harness_1.failure)("$callStatic[Account;deposit;1]"), /isn't static/);
    });
    (0, node_test_1.it)("is inherited, and $super reaches the parent's", async () => {
        await (0, harness_1.output)("$class[Base;$field[static n;1]$method[static hi;$return[base]]]" +
            "$class[Kid;$extends[Base]$method[static hi;$return[$super[hi] kid]]]");
        strict_1.default.equal(await (0, harness_1.output)("$callStatic[Kid;hi]|$getStatic[Kid;n]"), "base kid|1");
    });
    (0, node_test_1.it)("starts over when the class is declared again", async () => {
        await (0, harness_1.output)("$setStatic[Counter;count;9]$class[Counter;$field[static count;0]]");
        strict_1.default.equal(await (0, harness_1.output)("$getStatic[Counter;count]"), "0");
    });
    (0, node_test_1.it)("refuses a default that reads its own field", async () => {
        await (0, harness_1.output)("$class[L;$field[static x;$getStatic[L;x]]]");
        strict_1.default.match(await (0, harness_1.failure)("$getStatic[L;x]"), /L\.x is read in its own default/);
    });
});
(0, node_test_1.describe)("modifiers in class files", () => {
    (0, node_test_1.it)("are written before the name in the keys", async () => {
        harness_1.bot.ext.classes.add({
            name: "F",
            fields: { "private hp": "1", "static readonly MAX": "2" },
            methods: { "static make": "$return[made]" },
        });
        strict_1.default.equal(await (0, harness_1.output)("$getStatic[F;MAX]|$callStatic[F;make]"), "2|made");
        strict_1.default.match(await (0, harness_1.failure)("$new[f;F]$getField[f;hp]"), /F\.hp is private/);
    });
});
//# sourceMappingURL=modifiers.test.js.map