import assert from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"
import { bot, failure, json, output } from "./support/harness"

const PLAYER =
    "$class[Player;" +
    "$field[name]" +
    "$field[hp;100]" +
    "$constructor[$setField[this;name;$env[name]];name]" +
    "$method[damage;$setField[this;hp;$math[$getField[this;hp]-$env[amount]]]$return[$getField[this;hp]];amount]" +
    "$method[greet;Hi, $getField[this;name]!]" +
    "$method[twice;$callMethod[this;greet] $callMethod[this;greet]]" +
    "]"

beforeEach(async () => {
    bot.ext.classes.clear()
    await output(PLAYER)
})

describe("$new", () => {
    it("puts a plain object in the variable, with the class name in __class", async () => {
        const env: Record<string, unknown> = {}
        await output("$new[p;Player;Steve]", env)

        assert.deepEqual(env.p, { __class: "Player", name: "Steve", hp: 100 })
    })

    it("runs the defaults for every instance, so they share nothing", async () => {
        const env: Record<string, unknown> = {}
        await output(String.raw`$class[Bag;$field[items;[\]]]$new[a;Bag]$new[b;Bag]`, env)

        const [a, b] = [env.a, env.b] as Array<{ items: unknown[] }>
        assert.deepEqual(a.items, [])
        assert.notEqual(a.items, b.items)
    })

    it("lets a default read the fields declared before it", async () => {
        assert.equal(
            await output("$class[C;$field[a;2]$field[b;$math[$getField[this;a]*3]]]$new[c;C]$getField[c;b]"),
            "6"
        )
    })

    it("checks the constructor's arguments", async () => {
        assert.match(await failure("$new[p;Player]"), /Player's constructor takes 1 argument, got 0/)
        assert.match(await failure("$class[Plain;$field[x]]$new[p;Plain;1]"), /Plain has no constructor/)
    })

    it("refuses a class that isn't defined", async () => {
        assert.match(await failure("$new[p;Nope]"), /The class Nope is not defined/)
    })

    it("refuses variable names that lead to the prototype or hide this", async () => {
        assert.match(await failure("$new[__proto__;Player;x]"), /leads to the prototype/)
        assert.match(await failure("$new[this;Player;x]"), /"this" is the instance/)
    })
})

describe("$callMethod", () => {
    it("changes fields of the instance and returns what $return gives", async () => {
        assert.equal(await output("$new[p;Player;Steve]$callMethod[p;damage;30]|$getField[p;hp]"), "70|70")
    })

    it("returns what the method outputs when it doesn't $return", async () => {
        assert.equal(await output("$new[p;Player;Steve]$callMethod[p;greet]"), "Hi, Steve!")
    })

    it("lets a method call others on this", async () => {
        assert.equal(await output("$new[p;Player;Steve]$callMethod[p;twice]"), "Hi, Steve! Hi, Steve!")
    })

    it("keeps the arguments and the $let of a method out of the caller", async () => {
        await output("$class[T;$method[m;$let[x;inner]$get[x];a]]")

        assert.equal(await output("$let[x;outer]$new[t;T]$callMethod[t;m;1]|$get[x]|$env[a]"), "inner|outer|")
    })

    it("checks the number of arguments", async () => {
        assert.match(
            await failure("$new[p;Player;Steve]$callMethod[p;damage]"),
            /Player\.damage takes 1 argument, got 0/
        )
        assert.match(
            await failure("$new[p;Player;Steve]$callMethod[p;greet;x]"),
            /Player\.greet takes 0 arguments, got 1/
        )
    })

    it("refuses a method the class doesn't have, and the constructor", async () => {
        assert.match(await failure("$new[p;Player;Steve]$callMethod[p;fly]"), /Player has no method fly/)
        assert.match(await failure("$new[p;Player;Steve]$callMethod[p;constructor;x]"), /runs from \$new/)
    })

    it("refuses a variable without an instance, or whose class is gone", async () => {
        assert.match(await failure("$callMethod[nope;greet]"), /"nope" does not hold a class instance/)
        assert.match(
            await failure("$new[p;Player;Steve]$deleteClass[Player]$callMethod[p;greet]"),
            /an instance of Player, which is not defined/
        )
    })

    it("hands an error inside the method on", async () => {
        await output("$class[Bad;$method[run;$getField[this;nope]]]")
        assert.match(await failure("$new[b;Bad]$callMethod[b;run]"), /Bad has no field nope/)
    })
})

describe("fields", () => {
    it("stores numbers as numbers and keeps IDs exact", async () => {
        const env: Record<string, unknown> = {}
        await output("$class[U;$field[id]$field[n]]$new[u;U]$setField[u;id;123456789012345678901]$setField[u;n;5]", env)

        assert.deepEqual(env.u, { __class: "U", id: "123456789012345678901", n: 5 })
        assert.equal(
            await output("$new[u;U]$setField[u;id;123456789012345678901]$getField[u;id]"),
            "123456789012345678901"
        )
    })

    it("stores JSON as JSON", async () => {
        const env: Record<string, unknown> = {}
        await output(String.raw`$class[J;$field[tags]]$new[j;J]$setField[j;tags;["a","b"\]]`, env)

        assert.deepEqual((env.j as { tags: unknown }).tags, ["a", "b"])
    })

    it("refuses fields the class doesn't declare", async () => {
        assert.match(await failure("$new[p;Player;Steve]$setField[p;hpp;1]"), /Player has no field hpp/)
        assert.match(await failure("$new[p;Player;Steve]$getField[p;hpp]"), /Player has no field hpp/)
        assert.equal(await output("$new[p;Player;Steve]$hasField[p;hp]|$hasField[p;hpp]"), "true|false")
    })

    it("won't change __class", async () => {
        assert.match(await failure("$new[p;Player;Steve]$setField[p;__class;Other]"), /can't be changed/)
    })

    it("lists the fields of an instance without its class name", async () => {
        assert.deepEqual(await json("$new[p;Player;Steve]$instanceFields[p]"), { name: "Steve", hp: 100 })
    })

    it("comes back as an instance from its JSON", async () => {
        const saved = await output("$new[p;Player;Steve]$setField[p;hp;70]$env[p]")
        assert.equal(await output(`$jsonLoad[q;${saved}]$callMethod[q;greet] $getField[q;hp]`), "Hi, Steve! 70")
    })
})

describe("inheritance", () => {
    beforeEach(async () => {
        await output(
            "$class[Animal;$field[name]$field[sound;...]" +
                "$constructor[$setField[this;name;$env[name]];name]" +
                "$method[speak;$getField[this;name] says $getField[this;sound]]]" +
                "$class[Dog;$extends[Animal]$field[sound;woof]$method[speak;$super[speak]!]]"
        )
    })

    it("inherits fields, the constructor and methods, and overrides them", async () => {
        const env: Record<string, unknown> = {}

        assert.equal(await output("$new[d;Dog;Rex]$callMethod[d;speak]", env), "Rex says woof!")
        assert.deepEqual(env.d, { __class: "Dog", name: "Rex", sound: "woof" })
    })

    it("calls the parent's constructor through $super", async () => {
        await output(
            "$class[Puppy;$extends[Dog]$field[age;0]" +
                "$constructor[$super[constructor;$env[name]]$setField[this;age;$env[age]];name;age]]"
        )

        assert.deepEqual(await json("$new[p;Puppy;Bo;1]$instanceFields[p]"), { name: "Bo", sound: "woof", age: 1 })
    })

    it("lists inherited fields and methods once", async () => {
        assert.deepEqual(await json("$classFields[Dog]"), ["name", "sound"])
        assert.deepEqual(await json("$classMethods[Dog]"), ["speak"])
        assert.equal(await output("$classParent[Dog]"), "Animal")
    })

    it("knows what an instance is", async () => {
        const code = "$new[d;Dog;Rex]$new[a;Animal;Tom]$instanceOf[d;Animal] $instanceOf[d;Dog] $instanceOf[a;Dog]"
        assert.equal(await output(code), "true true false")

        assert.equal(await output("$new[d;Dog;Rex]$className[d] $isInstance[d] $isInstance[nope]"), "Dog true false")
    })

    it("refuses $super outside a method, or without a parent", async () => {
        assert.match(await failure("$super[speak]"), /only be used inside a method/)

        await output("$class[Solo;$method[m;$super[m]]]")
        assert.match(await failure("$new[s;Solo]$callMethod[s;m]"), /Solo has no parent class/)
    })

    it("won't delete a class another one extends", async () => {
        assert.match(await failure("$deleteClass[Animal]"), /Animal can't be deleted while Dog extends it/)
        assert.equal(await output("$deleteClass[Dog]|$deleteClass[Dog]|$classExists[Dog]"), "true|false|false")
    })
})

describe("control flow out of a method", () => {
    beforeEach(async () => {
        await output(
            "$class[Shop;" +
                "$method[buy;$break]" +
                "$method[skip;$continue]" +
                "$method[inner;$loop[3;$break]done]" +
                "$method[check;$if[1==1;$return[yes]]no]" +
                "$method[halt;$stop]]"
        )
    })

    it("turns a $break that left the method into an error, instead of breaking the caller's loop", async () => {
        assert.match(
            await failure("$new[s;Shop]$loop[2;$callMethod[s;buy]]"),
            /\$break is not inside a loop in Shop\.buy/
        )
        assert.match(await failure("$new[s;Shop]$callMethod[s;skip]"), /\$continue is not inside a loop in Shop\.skip/)
    })

    it("leaves a $break to the loop inside the method", async () => {
        assert.equal(await output("$new[s;Shop]$callMethod[s;inner]"), "done")
    })

    it("returns from inside an $if", async () => {
        assert.equal(await output("$new[s;Shop]$callMethod[s;check]"), "yes")
    })

    it("stops the whole command on $stop", async () => {
        const run = await bot.run("$new[s;Shop]before$callMethod[s;halt]after")

        assert.equal(run.output, null)
        assert.deepEqual(run.errors, [])
    })
})
