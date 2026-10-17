import assert from "node:assert/strict"
import { ArgType } from "@tryforge/forgescript"
import { beforeEach, describe, it } from "node:test"
import { ParamType } from ".."
import { bot, failure, json, output } from "./support/harness"

beforeEach(() => bot.ext.classes.clear())

describe("$param", () => {
    it("converts an arg to its type", async () => {
        await output("$class[Calc;$method[double;$return[$math[$env[n]*2]];$param[n;Number]]]")
        assert.equal(await output("$new[c;Calc]$callMethod[c;double;21]"), "42")
    })

    it("refuses an arg of the wrong type, as ForgeScript does", async () => {
        await output("$class[Calc;$method[double;$return[$math[$env[n]*2]];$param[n;Number]]]")
        assert.match(
            await failure("$new[c;Calc]$callMethod[c;double;abc]"),
            /abc.*for argument.*n.*is not of type.*Number/
        )
    })

    it("hands the method what the type gives", async () => {
        await output(`$class[Box;$method[get;$return[$env[data;a]];$param[data;Json]]]`)
        assert.equal(await output(`$new[b;Box]$callMethod[b;get;{"a":5}]`), "5")
    })

    it("leaves params without $param as text", async () => {
        await output("$class[M;$method[m;$return[$env[a]/$env[b]];a;$param[b;Number]]]")
        assert.equal(await output("$new[m;M]$callMethod[m;m;007;007]"), "007/7")
    })

    it("takes an optional arg, or none", async () => {
        await output("$class[G;$method[greet;$return[Hi$if[$env[name]!=; $env[name]]];$param[name;String;false]]]")

        assert.equal(await output("$new[g;G]$callMethod[g;greet]|$callMethod[g;greet;Ann]"), "Hi|Hi Ann")
        assert.match(await failure("$new[g;G]$callMethod[g;greet;a;b]"), /G\.greet takes at most 1 argument, got 2/)
    })

    it("gathers the rest into an array", async () => {
        await output(
            "$class[R;" +
                "$method[nums;$return[$env[nums]];$param[nums;Number;true;true]]" +
                "$method[tags;$return[$env[tags]];$param[tags;String;false;true]]]"
        )

        assert.deepEqual(await json("$new[r;R]$callMethod[r;nums;1;2;3]"), [1, 2, 3])
        assert.deepEqual(await json("$new[r;R]$callMethod[r;tags]"), [])
        assert.match(await failure("$new[r;R]$callMethod[r;nums]"), /R\.nums takes at least 1 argument, got 0/)
    })

    it("types the constructor's params too", async () => {
        await output("$class[P;$field[age]$constructor[$setField[this;age;$env[age]];$param[age;Number]]]")

        assert.equal(await output("$new[p;P;5]$getField[p;age]"), "5")
        assert.match(await failure("$new[p;P;old]"), /old.*for argument.*age.*is not of type.*Number/)
    })

    for (const code of [
        "$param[x;Number]",
        "$class[A;$param[x;Number]]",
        "$class[A;$method[m;$param[x;Number]]]$new[a;A]$callMethod[a;m]",
    ]) {
        it(`is refused outside the params: ${code}`, async () => {
            assert.match(await failure(code), /\$param can only be used in the params of \$method or \$constructor/)
        })
    }

    it("refuses a type that doesn't exist, and Enum", async () => {
        assert.match(await failure("$class[A;$method[m;1;$param[x;Numbr]]]"), /Numbr.*is not of type.*Enum/)
        assert.match(await failure("$class[A;$method[m;1;$param[x;Enum]]]"), /Enum.*for argument.*type.*is not of type/)
    })

    it("refuses a rest param before the last, and a required one after an optional", async () => {
        assert.match(
            await failure("$class[A;$method[m;1;$param[a;String;true;true];b]]"),
            /Only the last param can be rest, not a/
        )
        assert.match(
            await failure("$class[A;$method[m;1;$param[a;Number;false];b]]"),
            /The required param b can't come after an optional one/
        )
    })
})

describe("typed params in class files", () => {
    it("are written as in ForgeScript's own functions", async () => {
        bot.ext.classes.add({
            name: "Calc",
            methods: {
                double: { params: [{ name: "n", type: "Number" }], code: "$return[$math[$env[n]*2]]" },
                mix: {
                    params: ["a", { name: "b", type: ArgType.Number, required: false }],
                    code: "$return[$env[a]/$env[b]]",
                },
            },
        })

        assert.equal(await output("$new[c;Calc]$callMethod[c;double;21]"), "42")
        assert.equal(await output("$new[c;Calc]$callMethod[c;mix;x]|$callMethod[c;mix;x;3]"), "x/|x/3")
    })

    it("type the constructor's params too", async () => {
        bot.ext.classes.add({
            name: "Age",
            fields: { years: 0 },
            methods: {
                constructor: {
                    params: [
                        { name: "years", type: ParamType.Number },
                        { name: "unit", type: "String", required: false },
                    ],
                    code: "$setField[this;years;$env[years]]",
                },
            },
        })

        assert.equal(await output("$new[a;Age;4]$getField[a;years]"), "4")
        assert.match(await failure("$new[a;Age;old]"), /old.*for argument.*years.*is not of type.*Number/)
    })

    it("take a ParamType, which is ForgeScript's arg types without Enum", async () => {
        bot.ext.classes.add({
            name: "Box",
            methods: { get: { params: [{ name: "data", type: ParamType.Json }], code: "$return[$env[data;a]]" } },
        })

        assert.equal(await output(`$new[b;Box]$callMethod[b;get;{"a":5}]`), "5")
        assert.equal(ParamType.Number, ArgType.Number)
        assert.ok(!("Enum" in ParamType) && !(String(ArgType.Enum) in ParamType))
    })

    it("refuse a type that doesn't exist, and Enum", () => {
        assert.throws(
            () =>
                bot.ext.classes.add({
                    name: "A",
                    methods: { m: { params: [{ name: "n", type: "Enum" as never }], code: "1" } },
                }),
            /Param n can't be an Enum/
        )
        assert.throws(
            () =>
                bot.ext.classes.add({
                    name: "A",
                    methods: { m: { params: [{ name: "n", type: "Numbr" as never }], code: "1" } },
                }),
            /"Numbr" is not a type, in param n/
        )
    })
})
