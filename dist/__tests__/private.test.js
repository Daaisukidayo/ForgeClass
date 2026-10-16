"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const harness_1 = require("./support/harness");
const WALLET = "$class[Wallet;" +
    "$field[owner]" +
    "$field[#pin;1234]" +
    "$field[#tries;0]" +
    "$constructor[$setField[this;owner;$env[owner]];owner]" +
    "$method[#check;$if[$env[pin]==$getField[this;#pin];true;false];pin]" +
    "$method[unlock;$setField[this;#tries;$math[$getField[this;#tries]+1]]$callMethod[this;#check;$env[pin]];pin]" +
    "$method[tries;$getField[this;#tries]]" +
    "$method[hasPin;$hasField[this;#pin]]" +
    "]";
(0, node_test_1.beforeEach)(async () => {
    harness_1.bot.ext.classes.clear();
    await (0, harness_1.output)(WALLET);
});
(0, node_test_1.describe)("# members", () => {
    (0, node_test_1.it)("are kept off the instance and out of every list", async () => {
        const env = {};
        await (0, harness_1.output)("$new[w;Wallet;Ann]", env);
        strict_1.default.deepEqual(env.w, { __class: "Wallet", owner: "Ann" });
        strict_1.default.deepEqual(await (0, harness_1.json)("$new[w;Wallet;Ann]$instanceFields[w]"), { owner: "Ann" });
        strict_1.default.deepEqual(await (0, harness_1.json)("$classFields[Wallet]"), ["owner"]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$classMethods[Wallet]"), ["unlock", "tries", "hasPin"]);
    });
    (0, node_test_1.it)("are reached from the methods of their class", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$new[w;Wallet;Ann]$callMethod[w;unlock;0] $callMethod[w;unlock;1234] $callMethod[w;tries]"), "false true 2");
        strict_1.default.equal(await (0, harness_1.output)("$new[w;Wallet;Ann]$callMethod[w;hasPin]"), "true");
    });
    for (const code of [
        "$getField[w;#pin]",
        "$setField[w;#pin;1]",
        "$hasField[w;#pin]",
        "$hasMethod[w;#check]",
        "$callMethod[w;#check;1]",
    ]) {
        (0, node_test_1.it)(`are refused outside the class: ${code}`, async () => {
            strict_1.default.match(await (0, harness_1.failure)(`$new[w;Wallet;Ann]${code}`), /#\w+ can only be used inside the methods of its class/);
        });
    }
    (0, node_test_1.it)("are seen by $hasMethod from the methods of their class", async () => {
        await (0, harness_1.output)("$class[H;$method[#run;1]$method[has;$hasMethod[this;#run]|$hasMethod[this;#nope]]]");
        strict_1.default.equal(await (0, harness_1.output)("$new[h;H]$callMethod[h;has]"), "true|false");
    });
    (0, node_test_1.it)("let a default read the # fields declared before it", async () => {
        await (0, harness_1.output)("$class[C;$field[#a;2]$field[#b;$math[$getField[this;#a]*5]]$method[b;$getField[this;#b]]]");
        strict_1.default.equal(await (0, harness_1.output)("$new[c;C]$callMethod[c;b]"), "10");
    });
    (0, node_test_1.it)("may share a name with a public member", async () => {
        await (0, harness_1.output)("$class[S;$field[x;pub]$field[#x;priv]$method[both;$getField[this;x]/$getField[this;#x]]]");
        strict_1.default.equal(await (0, harness_1.output)("$new[s;S]$callMethod[s;both]"), "pub/priv");
    });
    (0, node_test_1.it)("come back empty on an instance loaded from JSON", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$new[w;Wallet;Ann]$jsonLoad[q;$env[w]]$callMethod[q;unlock;1234]"), "false");
    });
});
(0, node_test_1.describe)("# members and inheritance", () => {
    (0, node_test_1.it)("give a parent and a child their own # field of the same name", async () => {
        await (0, harness_1.output)("$class[Base;$field[#x;base]$method[baseX;$getField[this;#x]]]" +
            "$class[Child;$extends[Base]$field[#x;child]$method[childX;$getField[this;#x]]]");
        strict_1.default.equal(await (0, harness_1.output)("$new[c;Child]$callMethod[c;baseX]|$callMethod[c;childX]"), "base|child");
    });
    (0, node_test_1.it)("keep a parent's # field from its child", async () => {
        await (0, harness_1.output)("$class[Base;$field[#x;1]]$class[Child;$extends[Base]$method[peek;$getField[this;#x]]]");
        strict_1.default.match(await (0, harness_1.failure)("$new[c;Child]$callMethod[c;peek]"), /Child has no field #x/);
    });
    (0, node_test_1.it)("keep a parent's # method from $super", async () => {
        await (0, harness_1.output)("$class[P;$method[#m;p]]$class[K;$extends[P]$method[go;$super[#m]]]");
        strict_1.default.match(await (0, harness_1.failure)("$new[k;K]$callMethod[k;go]"), /P has no method #m/);
    });
    (0, node_test_1.it)("reach another instance of the class, and nothing else", async () => {
        await (0, harness_1.output)("$class[A;$field[#v;1]$method[peek;$getField[$env[other];#v];other]]$class[B;$field[n]]");
        strict_1.default.equal(await (0, harness_1.output)("$new[a;A]$new[a2;A]$callMethod[a;peek;a2]"), "1");
        strict_1.default.match(await (0, harness_1.failure)("$new[a;A]$new[b;B]$callMethod[a;peek;b]"), /#v belongs to A, and this is a B/);
    });
});
(0, node_test_1.describe)("# names", () => {
    (0, node_test_1.it)("need a name after the #, and can't be #constructor", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$class[A;$field[#]]"), /A # field needs a name after the #/);
        strict_1.default.match(await (0, harness_1.failure)("$class[A;$method[#constructor;1]]"), /"#constructor" can't be a name/);
    });
    (0, node_test_1.it)("work in class files", async () => {
        harness_1.bot.ext.classes.add({
            name: "Token",
            fields: { "#secret": "abc" },
            methods: { reveal: "$getField[this;#secret]" },
        });
        strict_1.default.equal(await (0, harness_1.output)("$new[t;Token]$callMethod[t;reveal]"), "abc");
        strict_1.default.deepEqual(await (0, harness_1.json)("$classFields[Token]"), []);
    });
});
//# sourceMappingURL=private.test.js.map