import assert from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"
import { bot, failure, json, output } from "./support/harness"

const WALLET =
    "$class[Wallet;" +
    "$field[owner]" +
    "$field[#pin;1234]" +
    "$field[#tries;0]" +
    "$constructor[$setField[this;owner;$env[owner]];owner]" +
    "$method[#check;$if[$env[pin]==$getField[this;#pin];true;false];pin]" +
    "$method[unlock;$setField[this;#tries;$math[$getField[this;#tries]+1]]$callMethod[this;#check;$env[pin]];pin]" +
    "$method[tries;$getField[this;#tries]]" +
    "$method[hasPin;$hasField[this;#pin]]" +
    "]"

beforeEach(async () => {
    bot.ext.classes.clear()
    await output(WALLET)
})

describe("# members", () => {
    it("are kept off the instance and out of every list", async () => {
        const env: Record<string, unknown> = {}
        await output("$new[w;Wallet;Ann]", env)

        assert.deepEqual(env.w, { __class: "Wallet", owner: "Ann" })
        assert.deepEqual(await json("$new[w;Wallet;Ann]$instanceFields[w]"), { owner: "Ann" })
        assert.deepEqual(await json("$classFields[Wallet]"), ["owner"])
        assert.deepEqual(await json("$classMethods[Wallet]"), ["unlock", "tries", "hasPin"])
    })

    it("are reached from the methods of their class", async () => {
        assert.equal(
            await output("$new[w;Wallet;Ann]$callMethod[w;unlock;0] $callMethod[w;unlock;1234] $callMethod[w;tries]"),
            "false true 2"
        )
        assert.equal(await output("$new[w;Wallet;Ann]$callMethod[w;hasPin]"), "true")
    })

    for (const code of ["$getField[w;#pin]", "$setField[w;#pin;1]", "$hasField[w;#pin]", "$callMethod[w;#check;1]"]) {
        it(`are refused outside the class: ${code}`, async () => {
            assert.match(
                await failure(`$new[w;Wallet;Ann]${code}`),
                /#\w+ can only be used inside the methods of its class/
            )
        })
    }

    it("let a default read the # fields declared before it", async () => {
        await output("$class[C;$field[#a;2]$field[#b;$math[$getField[this;#a]*5]]$method[b;$getField[this;#b]]]")
        assert.equal(await output("$new[c;C]$callMethod[c;b]"), "10")
    })

    it("may share a name with a public member", async () => {
        await output("$class[S;$field[x;pub]$field[#x;priv]$method[both;$getField[this;x]/$getField[this;#x]]]")
        assert.equal(await output("$new[s;S]$callMethod[s;both]"), "pub/priv")
    })

    it("come back empty on an instance loaded from JSON", async () => {
        assert.equal(await output("$new[w;Wallet;Ann]$jsonLoad[q;$env[w]]$callMethod[q;unlock;1234]"), "false")
    })
})

describe("# members and inheritance", () => {
    it("give a parent and a child their own # field of the same name", async () => {
        await output(
            "$class[Base;$field[#x;base]$method[baseX;$getField[this;#x]]]" +
                "$class[Child;$extends[Base]$field[#x;child]$method[childX;$getField[this;#x]]]"
        )

        assert.equal(await output("$new[c;Child]$callMethod[c;baseX]|$callMethod[c;childX]"), "base|child")
    })

    it("keep a parent's # field from its child", async () => {
        await output("$class[Base;$field[#x;1]]$class[Child;$extends[Base]$method[peek;$getField[this;#x]]]")
        assert.match(await failure("$new[c;Child]$callMethod[c;peek]"), /Child has no field #x/)
    })

    it("keep a parent's # method from $super", async () => {
        await output("$class[P;$method[#m;p]]$class[K;$extends[P]$method[go;$super[#m]]]")
        assert.match(await failure("$new[k;K]$callMethod[k;go]"), /P has no method #m/)
    })

    it("reach another instance of the class, and nothing else", async () => {
        await output("$class[A;$field[#v;1]$method[peek;$getField[$env[other];#v];other]]$class[B;$field[n]]")

        assert.equal(await output("$new[a;A]$new[a2;A]$callMethod[a;peek;a2]"), "1")
        assert.match(await failure("$new[a;A]$new[b;B]$callMethod[a;peek;b]"), /#v belongs to A, and this is a B/)
    })
})

describe("# names", () => {
    it("need a name after the #, and can't be #constructor", async () => {
        assert.match(await failure("$class[A;$field[#]]"), /A # field needs a name after the #/)
        assert.match(await failure("$class[A;$method[#constructor;1]]"), /"#constructor" can't be a name/)
    })

    it("work in class files", async () => {
        bot.ext.classes.add({
            name: "Token",
            fields: { "#secret": "abc" },
            methods: { reveal: "$getField[this;#secret]" },
        })

        assert.equal(await output("$new[t;Token]$callMethod[t;reveal]"), "abc")
        assert.deepEqual(await json("$classFields[Token]"), [])
    })
})
