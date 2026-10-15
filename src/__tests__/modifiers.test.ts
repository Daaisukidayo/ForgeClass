import assert from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"
import { parseDeclaration } from "../functions/declaration"
import { bot, failure, json, output } from "./support/harness"

beforeEach(() => bot.ext.classes.clear())

describe("parseDeclaration", () => {
    it("reads the modifiers before the name", () => {
        assert.deepEqual(parseDeclaration("private readonly id", "field"), {
            ok: true,
            value: { name: "id", access: "private", static: false, readonly: true },
        })
        assert.deepEqual(parseDeclaration("static protected count", "field"), {
            ok: true,
            value: { name: "count", access: "protected", static: true, readonly: false },
        })
        assert.deepEqual(parseDeclaration("#token", "field"), {
            ok: true,
            value: { name: "#token", access: "private", static: false, readonly: false },
        })
    })

    for (const [text, kind, reason] of [
        ["privat hp", "field", /"privat" is not a modifier of hp/],
        ["public private hp", "field", /can't be both public and private/],
        ["static static n", "field", /n has "static" twice/],
        ["protected #x", "field", /#x is private through its #/],
        ["readonly run", "method", /The method run can't be readonly/],
        ["static constructor", "method", /The constructor takes no modifiers/],
    ] as const) {
        it(`refuses "${text}"`, () => {
            const parsed = parseDeclaration(text, kind)

            assert.equal(parsed.ok, false)
            if (!parsed.ok) assert.match(parsed.reason, reason)
        })
    }
})

const ACCOUNT =
    "$class[Account;" +
    "$field[private balance;0]" +
    "$field[protected owner]" +
    "$field[readonly id;7]" +
    "$constructor[$setField[this;owner;$env[owner]];owner]" +
    "$method[private log;$return[logged]]" +
    "$method[deposit;$setField[this;balance;$math[$getField[this;balance]+$env[n]]]$return[$getField[this;balance]];n]" +
    "$method[audit;$return[$callMethod[this;log]]]" +
    "$method[fields;$return[$instanceFields[this]]]" +
    "$method[rename;$setField[this;id;8]]" +
    "]"

describe("private and protected", () => {
    beforeEach(() => output(ACCOUNT))

    it("keep private members to their class", async () => {
        assert.equal(await output("$new[a;Account;Ann]$callMethod[a;deposit;5]|$callMethod[a;audit]"), "5|logged")

        assert.match(await failure("$new[a;Account;Ann]$getField[a;balance]"), /Account\.balance is private/)
        assert.match(await failure("$new[a;Account;Ann]$setField[a;balance;9]"), /Account\.balance is private/)
        assert.match(await failure("$new[a;Account;Ann]$callMethod[a;log]"), /Account\.log is private/)
    })

    it("let a child reach protected members, but not private ones", async () => {
        await output(
            "$class[Savings;$extends[Account]$method[who;$return[$getField[this;owner]]]$method[peek;$return[$getField[this;balance]]]]"
        )

        assert.equal(await output("$new[s;Savings;Ann]$callMethod[s;who]"), "Ann")
        assert.match(await failure("$new[s;Savings;Ann]$callMethod[s;peek]"), /Account\.balance is private/)
        assert.match(await failure("$new[a;Account;Ann]$getField[a;owner]"), /Account\.owner is protected/)
    })

    it("hide what can't be reached from the lists", async () => {
        assert.deepEqual(await json("$new[a;Account;Ann]$instanceFields[a]"), { id: 7 })
        assert.deepEqual(await json("$new[a;Account;Ann]$callMethod[a;fields]"), { balance: 0, owner: "Ann", id: 7 })
        assert.deepEqual(await json("$classFields[Account]"), ["id"])
        assert.deepEqual(await json("$classMethods[Account]"), ["deposit", "audit", "fields", "rename"])
        assert.equal(await output("$new[a;Account;Ann]$hasField[a;balance]|$hasField[a;id]"), "false|true")
    })
})

describe("readonly", () => {
    beforeEach(() => output(ACCOUNT))

    it("is set by a default or the constructor, and nowhere else", async () => {
        await output("$class[Tag;$field[readonly v]$constructor[$setField[this;v;$env[v]];v]]")

        assert.equal(await output("$new[t;Tag;x]$getField[t;v]"), "x")
        assert.match(await failure("$new[a;Account;Ann]$setField[a;id;8]"), /Account\.id is readonly/)
        assert.match(await failure("$new[a;Account;Ann]$callMethod[a;rename]"), /Account\.id is readonly/)
    })

    it("keeps $super[constructor] to constructors", async () => {
        await output("$class[P;$constructor[1]]$class[C;$extends[P]$method[m;$super[constructor]]]")
        assert.match(await failure("$new[c;C]$callMethod[c;m]"), /\[constructor\] can only be used in a constructor/)
    })
})

describe("static", () => {
    beforeEach(() =>
        output(
            "$class[Counter;" +
                "$field[static count;0]" +
                "$field[static readonly MAX;3]" +
                "$field[private static secret;s]" +
                "$method[static bump;$setStatic[Counter;count;$math[$getStatic[Counter;count]+1]]$return[$getStatic[Counter;count]]]" +
                "$method[static peek;$return[$getStatic[Counter;secret]]]" +
                "$method[static who;$return[$isInstance[this]]]]"
        )
    )

    it("keeps one value for the class, across commands", async () => {
        assert.equal(await output("$callStatic[Counter;bump]|$callStatic[Counter;bump]"), "1|2")
        assert.equal(await output("$getStatic[Counter;count]"), "2")
    })

    it("refuses to change a readonly one, and keeps private ones in", async () => {
        assert.match(await failure("$setStatic[Counter;MAX;5]"), /Counter\.MAX is readonly/)
        assert.equal(await output("$getStatic[Counter;MAX]"), "3")

        assert.match(await failure("$getStatic[Counter;secret]"), /Counter\.secret is private/)
        assert.equal(await output("$callStatic[Counter;peek]"), "s")
    })

    it("has no this, and isn't mixed up with instance methods", async () => {
        await output(ACCOUNT)

        assert.equal(await output("$callStatic[Counter;who]"), "false")
        assert.match(await failure("$new[c;Counter]$callMethod[c;bump]"), /is static, call it with \$callStatic/)
        assert.match(await failure("$callStatic[Account;deposit;1]"), /isn't static/)
    })

    it("is inherited, and $super reaches the parent's", async () => {
        await output(
            "$class[Base;$field[static n;1]$method[static hi;$return[base]]]" +
                "$class[Kid;$extends[Base]$method[static hi;$return[$super[hi] kid]]]"
        )

        assert.equal(await output("$callStatic[Kid;hi]|$getStatic[Kid;n]"), "base kid|1")
    })

    it("starts over when the class is declared again", async () => {
        await output("$setStatic[Counter;count;9]$class[Counter;$field[static count;0]]")
        assert.equal(await output("$getStatic[Counter;count]"), "0")
    })

    it("refuses a default that reads its own field", async () => {
        await output("$class[L;$field[static x;$getStatic[L;x]]]")
        assert.match(await failure("$getStatic[L;x]"), /L\.x is read in its own default/)
    })
})

describe("modifiers in class files", () => {
    it("are written before the name in the keys", async () => {
        bot.ext.classes.add({
            name: "F",
            fields: { "private hp": "1", "static readonly MAX": "2" },
            methods: { "static make": "$return[made]" },
        })

        assert.equal(await output("$getStatic[F;MAX]|$callStatic[F;make]"), "2|made")
        assert.match(await failure("$new[f;F]$getField[f;hp]"), /F\.hp is private/)
    })
})
