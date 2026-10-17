import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, beforeEach, describe, it } from "node:test"
import { ForgeClassBuilder } from ".."
import { bot, failure, json, output } from "./support/harness"

const folders: string[] = []

/** Writes the files to a new temp folder, removed after the tests. Returns its path. */
function folderWith(files: Record<string, string>) {
    const root = mkdtempSync(join(tmpdir(), "forgeclass-test-"))
    folders.push(root)

    for (const [file, content] of Object.entries(files)) {
        mkdirSync(join(root, file, ".."), { recursive: true })
        writeFileSync(join(root, file), content)
    }

    return root
}

beforeEach(() => bot.ext.classes.clear())

after(() => {
    for (const folder of folders) rmSync(folder, { recursive: true, force: true })
})

describe("classes.add", () => {
    it("adds classes written as objects, a child before its parent", async () => {
        bot.ext.classes.add([
            { name: "Dog", extends: "Animal", fields: { sound: "woof" } },
            {
                name: "Animal",
                fields: { name: "", sound: "..." },
                methods: {
                    constructor: { params: ["name"], code: "$setField[this;name;$env[name]]" },
                    speak: "$getField[this;name] says $getField[this;sound]",
                },
            },
        ])

        assert.equal(await output("$new[d;Dog;Rex]$callMethod[d;speak]"), "Rex says woof")
    })

    it("takes numbers as defaults", async () => {
        bot.ext.classes.add({ name: "Counter", fields: { count: 0 } })
        assert.equal(await output("$new[c;Counter]$getField[c;count]"), "0")
    })

    it("runs every string of a default as code, even inside arrays and objects", async () => {
        bot.ext.classes.add({
            name: "Run",
            fields: {
                list: [],
                stats: { best: 1, by: "$math[1+1]", name: "Ann", id: "123456789012345678" },
                tags: ["a", "$math[2+2]"],
                owner: null,
                level: 2,
                code: "$math[1+1]",
                "static runs": [],
            },
        })

        assert.deepEqual(await json("$new[r;Run]$instanceFields[r]"), {
            list: [],
            stats: { best: 1, by: 2, name: "Ann", id: "123456789012345678" },
            tags: ["a", 4],
            owner: null,
            level: 2,
            code: 2,
        })
        assert.equal(await output("$getStatic[Run;runs]"), "[]")
    })

    it("reports a string inside a default that doesn't compile when it first runs", async () => {
        bot.ext.classes.add({ name: "Broken", fields: { stats: { by: "$getField[this" } } })
        assert.match(await failure("$new[b;Broken]"), /Could not compile the default of Broken\.stats/)
    })

    it("gives every instance its own copy of a default", async () => {
        bot.ext.classes.add({ name: "Bag", fields: { items: [] } })

        const { env } = await bot.run("$new[a;Bag]$new[b;Bag]")
        assert.deepEqual(env.a, { __class: "Bag", items: [] })
        assert.notEqual((env.a as { items: unknown }).items, (env.b as { items: unknown }).items)
    })

    it("throws on a default that holds anything else", () => {
        assert.throws(
            () => bot.ext.classes.add({ name: "Bad", fields: { run: { f: (() => 1) as never } } }),
            /Bad: "run" can only default to strings, numbers, booleans, null, arrays and objects/
        )
    })

    it("throws on a class that can't be used, and adds none of them", async () => {
        assert.throws(
            () => bot.ext.classes.add({ name: "A" }, { name: "B", extends: "Nope" }),
            /B extends Nope, which is not defined/
        )
        assert.equal(await output("$classExists[A]"), "false")

        assert.throws(() => bot.ext.classes.add({ name: "A" }, { name: "A" }), /The class A is declared twice/)
    })

    it("reports code that doesn't compile when it first runs", async () => {
        bot.ext.classes.add({ name: "Broken", methods: { run: "$getField[this" } })
        assert.match(await failure("$new[b;Broken]$callMethod[b;run]"), /Could not compile Broken\.run/)
    })
})

describe("classes.load", () => {
    it("loads the .js files of a folder and its subfolders", async () => {
        const root = folderWith({
            "player.js": `module.exports = ${JSON.stringify({
                name: "Player",
                fields: { hp: "100" },
                methods: { hit: { params: ["n"], code: "$setField[this;hp;$math[$getField[this;hp]-$env[n]]]" } },
            })}`,
            "pets/cats.js": `exports.default = [{ name: "Cat", fields: { lives: "9" } }]`,
            "helpers.js": `const unused = 1`,
            "dog.json": JSON.stringify({ name: "Dog" }),
        })

        bot.ext.classes.load(root)

        assert.equal(await output("$new[p;Player]$callMethod[p;hit;30]$getField[p;hp]"), "70")
        assert.equal(await output("$new[c;Cat]$getField[c;lives]"), "9")
        assert.equal(await output("$classExists[Dog]"), "false", "only .js files are loaded")
    })

    it("names the file of a class that can't be used", () => {
        const root = folderWith({ "bad.js": `module.exports = { name: "Bad", fields: { __class: "x" } }` })
        assert.throws(() => bot.ext.classes.load(root), /bad\.js: "__class" holds the class name/)
    })
})

describe("ForgeClassBuilder", () => {
    it("takes the same data as a plain object", async () => {
        bot.ext.classes.add(new ForgeClassBuilder({ name: "Counter", fields: { count: 0 } }))
        assert.equal(await output("$new[c;Counter]$getField[c;count]"), "0")
    })

    it("is taken next to plain objects, alone or in arrays", async () => {
        bot.ext.classes.add([new ForgeClassBuilder({ name: "Dog", extends: "Animal", fields: { sound: "woof" } })], {
            name: "Animal",
            fields: { sound: "..." },
            methods: { speak: "$return[$getField[this;sound]]" },
        })

        assert.equal(await output("$new[d;Dog]$callMethod[d;speak]"), "woof")
    })

    it("is loaded from a class file", async () => {
        const index = JSON.stringify(join(__dirname, "..", "index.js"))
        const root = folderWith({
            "pets.js":
                `const { ForgeClassBuilder } = require(${index})\n` +
                `module.exports = [new ForgeClassBuilder({ name: "Cat", fields: { lives: 9 } }), { name: "Fish" }]`,
        })

        bot.ext.classes.load(root)

        assert.equal(await output("$new[c;Cat]$getField[c;lives]|$classExists[Fish]"), "9|true")
    })

    it("wraps a plain object when resolved, and keeps a builder as it is", () => {
        const builder = new ForgeClassBuilder({ name: "A" })

        assert.equal(bot.ext.classes.resolve(builder), builder)
        assert.ok(bot.ext.classes.resolve({ name: "B" }) instanceof ForgeClassBuilder)
    })
})
