"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const harness_1 = require("./support/harness");
const PLAYER = "$class[Player;" +
    "$field[name]" +
    "$field[hp;100]" +
    "$constructor[$setField[this;name;$env[name]];name]" +
    "$method[damage;$setField[this;hp;$math[$getField[this;hp]-$env[amount]]]$return[$getField[this;hp]];amount]" +
    "$method[greet;Hi, $getField[this;name]!]" +
    "$method[twice;$callMethod[this;greet] $callMethod[this;greet]]" +
    "]";
(0, node_test_1.beforeEach)(async () => {
    harness_1.bot.ext.classes.clear();
    await (0, harness_1.output)(PLAYER);
});
(0, node_test_1.describe)("$new", () => {
    (0, node_test_1.it)("puts a plain object in the variable, with the class name in __class", async () => {
        const env = {};
        await (0, harness_1.output)("$new[p;Player;Steve]", env);
        strict_1.default.deepEqual(env.p, { __class: "Player", name: "Steve", hp: 100 });
    });
    (0, node_test_1.it)("runs the defaults for every instance, so they share nothing", async () => {
        const env = {};
        await (0, harness_1.output)(String.raw `$class[Bag;$field[items;[\]]]$new[a;Bag]$new[b;Bag]`, env);
        const [a, b] = [env.a, env.b];
        strict_1.default.deepEqual(a.items, []);
        strict_1.default.notEqual(a.items, b.items);
    });
    (0, node_test_1.it)("lets a default read the fields declared before it", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$class[C;$field[a;2]$field[b;$math[$getField[this;a]*3]]]$new[c;C]$getField[c;b]"), "6");
    });
    (0, node_test_1.it)("checks the constructor's arguments", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$new[p;Player]"), /Player's constructor takes 1 argument, got 0/);
        strict_1.default.match(await (0, harness_1.failure)("$class[Plain;$field[x]]$new[p;Plain;1]"), /Plain has no constructor/);
    });
    (0, node_test_1.it)("refuses a class that isn't defined", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$new[p;Nope]"), /The class Nope is not defined/);
    });
    (0, node_test_1.it)("refuses variable names that lead to the prototype or hide this", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$new[__proto__;Player;x]"), /leads to the prototype/);
        strict_1.default.match(await (0, harness_1.failure)("$new[this;Player;x]"), /"this" is the instance/);
    });
});
(0, node_test_1.describe)("$callMethod", () => {
    (0, node_test_1.it)("changes fields of the instance and returns what $return gives", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$new[p;Player;Steve]$callMethod[p;damage;30]|$getField[p;hp]"), "70|70");
    });
    (0, node_test_1.it)("returns what the method outputs when it doesn't $return", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$new[p;Player;Steve]$callMethod[p;greet]"), "Hi, Steve!");
    });
    (0, node_test_1.it)("lets a method call others on this", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$new[p;Player;Steve]$callMethod[p;twice]"), "Hi, Steve! Hi, Steve!");
    });
    (0, node_test_1.it)("keeps the arguments and the $let of a method out of the caller", async () => {
        await (0, harness_1.output)("$class[T;$method[m;$let[x;inner]$get[x];a]]");
        strict_1.default.equal(await (0, harness_1.output)("$let[x;outer]$new[t;T]$callMethod[t;m;1]|$get[x]|$env[a]"), "inner|outer|");
    });
    (0, node_test_1.it)("checks the number of arguments", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$new[p;Player;Steve]$callMethod[p;damage]"), /Player\.damage takes 1 argument, got 0/);
        strict_1.default.match(await (0, harness_1.failure)("$new[p;Player;Steve]$callMethod[p;greet;x]"), /Player\.greet takes 0 arguments, got 1/);
    });
    (0, node_test_1.it)("refuses a method the class doesn't have, and the constructor", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$new[p;Player;Steve]$callMethod[p;fly]"), /Player has no method fly/);
        strict_1.default.match(await (0, harness_1.failure)("$new[p;Player;Steve]$callMethod[p;constructor;x]"), /runs from \$new/);
    });
    (0, node_test_1.it)("refuses a variable without an instance, or whose class is gone", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$callMethod[nope;greet]"), /"nope" does not hold a class instance/);
        strict_1.default.match(await (0, harness_1.failure)("$new[p;Player;Steve]$deleteClass[Player]$callMethod[p;greet]"), /an instance of Player, which is not defined/);
    });
    (0, node_test_1.it)("hands an error inside the method on", async () => {
        await (0, harness_1.output)("$class[Bad;$method[run;$getField[this;nope]]]");
        strict_1.default.match(await (0, harness_1.failure)("$new[b;Bad]$callMethod[b;run]"), /Bad has no field nope/);
    });
});
(0, node_test_1.describe)("fields", () => {
    (0, node_test_1.it)("stores numbers as numbers and keeps IDs exact", async () => {
        const env = {};
        await (0, harness_1.output)("$class[U;$field[id]$field[n]]$new[u;U]$setField[u;id;123456789012345678901]$setField[u;n;5]", env);
        strict_1.default.deepEqual(env.u, { __class: "U", id: "123456789012345678901", n: 5 });
        strict_1.default.equal(await (0, harness_1.output)("$new[u;U]$setField[u;id;123456789012345678901]$getField[u;id]"), "123456789012345678901");
    });
    (0, node_test_1.it)("stores JSON as JSON", async () => {
        const env = {};
        await (0, harness_1.output)(String.raw `$class[J;$field[tags]]$new[j;J]$setField[j;tags;["a","b"\]]`, env);
        strict_1.default.deepEqual(env.j.tags, ["a", "b"]);
    });
    (0, node_test_1.it)("refuses fields the class doesn't declare", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$new[p;Player;Steve]$setField[p;hpp;1]"), /Player has no field hpp/);
        strict_1.default.match(await (0, harness_1.failure)("$new[p;Player;Steve]$getField[p;hpp]"), /Player has no field hpp/);
        strict_1.default.equal(await (0, harness_1.output)("$new[p;Player;Steve]$hasField[p;hp]|$hasField[p;hpp]"), "true|false");
    });
    (0, node_test_1.it)("says whether $callMethod can call a method", async () => {
        await (0, harness_1.output)("$class[Hero;$extends[Player]]");
        strict_1.default.equal(await (0, harness_1.output)("$new[h;Hero;Ann]$hasMethod[h;greet]|$hasMethod[h;fly]|$hasMethod[h;constructor]"), "true|false|false");
    });
    (0, node_test_1.it)("won't change __class", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$new[p;Player;Steve]$setField[p;__class;Other]"), /can't be changed/);
    });
    (0, node_test_1.it)("lists the fields of an instance without its class name", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$new[p;Player;Steve]$instanceFields[p]"), { name: "Steve", hp: 100 });
    });
    (0, node_test_1.it)("comes back as an instance from its JSON", async () => {
        const saved = await (0, harness_1.output)("$new[p;Player;Steve]$setField[p;hp;70]$env[p]");
        strict_1.default.equal(await (0, harness_1.output)(`$jsonLoad[q;${saved}]$callMethod[q;greet] $getField[q;hp]`), "Hi, Steve! 70");
    });
});
(0, node_test_1.describe)("inheritance", () => {
    (0, node_test_1.beforeEach)(async () => {
        await (0, harness_1.output)("$class[Animal;$field[name]$field[sound;...]" +
            "$constructor[$setField[this;name;$env[name]];name]" +
            "$method[speak;$getField[this;name] says $getField[this;sound]]]" +
            "$class[Dog;$extends[Animal]$field[sound;woof]$method[speak;$super[speak]!]]");
    });
    (0, node_test_1.it)("inherits fields, the constructor and methods, and overrides them", async () => {
        const env = {};
        strict_1.default.equal(await (0, harness_1.output)("$new[d;Dog;Rex]$callMethod[d;speak]", env), "Rex says woof!");
        strict_1.default.deepEqual(env.d, { __class: "Dog", name: "Rex", sound: "woof" });
    });
    (0, node_test_1.it)("calls the parent's constructor through $super", async () => {
        await (0, harness_1.output)("$class[Puppy;$extends[Dog]$field[age;0]" +
            "$constructor[$super[constructor;$env[name]]$setField[this;age;$env[age]];name;age]]");
        strict_1.default.deepEqual(await (0, harness_1.json)("$new[p;Puppy;Bo;1]$instanceFields[p]"), { name: "Bo", sound: "woof", age: 1 });
    });
    (0, node_test_1.it)("lists inherited fields and methods once", async () => {
        strict_1.default.deepEqual(await (0, harness_1.json)("$classFields[Dog]"), ["name", "sound"]);
        strict_1.default.deepEqual(await (0, harness_1.json)("$classMethods[Dog]"), ["speak"]);
        strict_1.default.equal(await (0, harness_1.output)("$classParent[Dog]"), "Animal");
    });
    (0, node_test_1.it)("knows what an instance is", async () => {
        const code = "$new[d;Dog;Rex]$new[a;Animal;Tom]$instanceOf[d;Animal] $instanceOf[d;Dog] $instanceOf[a;Dog]";
        strict_1.default.equal(await (0, harness_1.output)(code), "true true false");
        strict_1.default.equal(await (0, harness_1.output)("$new[d;Dog;Rex]$className[d] $isInstance[d] $isInstance[nope]"), "Dog true false");
    });
    (0, node_test_1.it)("refuses $super outside a method, or without a parent", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$super[speak]"), /only be used inside a method/);
        await (0, harness_1.output)("$class[Solo;$method[m;$super[m]]]");
        strict_1.default.match(await (0, harness_1.failure)("$new[s;Solo]$callMethod[s;m]"), /Solo has no parent class/);
    });
    (0, node_test_1.it)("won't delete a class another one extends", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$deleteClass[Animal]"), /Animal can't be deleted while Dog extends it/);
        strict_1.default.equal(await (0, harness_1.output)("$deleteClass[Dog]|$deleteClass[Dog]|$classExists[Dog]"), "true|false|false");
    });
});
(0, node_test_1.describe)("control flow out of a method", () => {
    (0, node_test_1.beforeEach)(async () => {
        await (0, harness_1.output)("$class[Shop;" +
            "$method[buy;$break]" +
            "$method[skip;$continue]" +
            "$method[inner;$loop[3;$break]done]" +
            "$method[check;$if[1==1;$return[yes]]no]" +
            "$method[halt;$stop]]");
    });
    (0, node_test_1.it)("turns a $break that left the method into an error, instead of breaking the caller's loop", async () => {
        strict_1.default.match(await (0, harness_1.failure)("$new[s;Shop]$loop[2;$callMethod[s;buy]]"), /\$break is not inside a loop in Shop\.buy/);
        strict_1.default.match(await (0, harness_1.failure)("$new[s;Shop]$callMethod[s;skip]"), /\$continue is not inside a loop in Shop\.skip/);
    });
    (0, node_test_1.it)("leaves a $break to the loop inside the method", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$new[s;Shop]$callMethod[s;inner]"), "done");
    });
    (0, node_test_1.it)("returns from inside an $if", async () => {
        strict_1.default.equal(await (0, harness_1.output)("$new[s;Shop]$callMethod[s;check]"), "yes");
    });
    (0, node_test_1.it)("stops the whole command on $stop", async () => {
        const run = await harness_1.bot.run("$new[s;Shop]before$callMethod[s;halt]after");
        strict_1.default.equal(run.output, null);
        strict_1.default.deepEqual(run.errors, []);
    });
});
//# sourceMappingURL=instance.test.js.map