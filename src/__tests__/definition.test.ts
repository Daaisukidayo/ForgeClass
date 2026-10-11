import assert from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"
import { bot, failure, json, output } from "./support/harness"

beforeEach(() => bot.ext.classes.clear())

describe("$class", () => {
    it("registers a class with its fields and methods", async () => {
        await output(
            "$class[Player;$field[name]$field[hp;100]$constructor[$setField[this;name;$env[name]];name]$method[heal;ok]]"
        )

        assert.equal(await output("$classExists[Player]"), "true")
        assert.deepEqual(await json("$classFields[Player]"), ["name", "hp"])
        assert.deepEqual(await json("$classMethods[Player]"), ["heal"], "the constructor is not a method to call")
        assert.equal(await output("$classParent[Player]"), "")
    })

    it("outputs nothing of its body", async () => {
        assert.equal(await output("$class[A;text $field[x] more]after"), "after")
    })

    it("replaces a class declared again under the same name", async () => {
        await output("$class[A;$field[x]]$class[A;$field[y]]")
        assert.deepEqual(await json("$classFields[A]"), ["y"])
    })

    for (const fn of ["$field[x]", "$method[m;code]", "$constructor[code]", "$extends[A]"]) {
        it(`refuses ${fn} outside $class`, async () => {
            assert.match(await failure(fn), /can only be used inside \$class/)
        })
    }

    it("refuses a class inside a class", async () => {
        assert.match(await failure("$class[A;$class[B;$field[x]]]"), /B can't be declared inside the class A/)
        assert.equal(await output("$classExists[A]"), "false")
    })

    it("refuses $return in the class body", async () => {
        assert.match(await failure("$class[A;$return[x]]"), /\$return can't be used in the body of class A/)
    })
})

describe("a class that can't be used", () => {
    const cases: Array<[string, string, RegExp]> = [
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
    ]

    for (const [what, body, reason] of cases) {
        it(`is refused for ${what}, and not registered`, async () => {
            await output("$class[B;$field[b]]$class[C;$field[c]]")

            assert.match(await failure(`$class[A;${body}]`), reason)
            assert.equal(await output("$classExists[A]"), "false")
        })
    }

    it("keeps the old class when the new one would close a circle", async () => {
        await output("$class[A;$field[a]]$class[B;$extends[A]]")

        assert.match(await failure("$class[A;$extends[B]]"), /A → B → A: these classes extend each other in a circle/)
        assert.equal(await output("$classParent[A]"), "")
        assert.deepEqual(await json("$classFields[A]"), ["a"])
    })
})
