"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const node_os_1 = require("node:os");
const node_path_1 = require("node:path");
const node_test_1 = require("node:test");
const __1 = require("..");
const harness_1 = require("./support/harness");
const folders = [];
function folderWith(files) {
    const root = (0, node_fs_1.mkdtempSync)((0, node_path_1.join)((0, node_os_1.tmpdir)(), "forgeclass-test-"));
    folders.push(root);
    for (const [file, content] of Object.entries(files)) {
        (0, node_fs_1.mkdirSync)((0, node_path_1.join)(root, file, ".."), { recursive: true });
        (0, node_fs_1.writeFileSync)((0, node_path_1.join)(root, file), content);
    }
    return root;
}
(0, node_test_1.beforeEach)(() => harness_1.bot.ext.classes.clear());
(0, node_test_1.after)(() => {
    for (const folder of folders)
        (0, node_fs_1.rmSync)(folder, { recursive: true, force: true });
});
(0, node_test_1.describe)("classes.add", () => {
    (0, node_test_1.it)("adds classes written as objects, a child before its parent", async () => {
        harness_1.bot.ext.classes.add([
            { name: "Dog", extends: "Animal", fields: { sound: "woof" } },
            {
                name: "Animal",
                fields: { name: "", sound: "..." },
                methods: {
                    constructor: { params: ["name"], code: "$setField[this;name;$env[name]]" },
                    speak: "$getField[this;name] says $getField[this;sound]",
                },
            },
        ]);
        strict_1.default.equal(await (0, harness_1.output)("$new[d;Dog;Rex]$callMethod[d;speak]"), "Rex says woof");
    });
    (0, node_test_1.it)("takes numbers as defaults", async () => {
        harness_1.bot.ext.classes.add({ name: "Counter", fields: { count: 0 } });
        strict_1.default.equal(await (0, harness_1.output)("$new[c;Counter]$getField[c;count]"), "0");
    });
    (0, node_test_1.it)("throws on a class that can't be used, and adds none of them", async () => {
        strict_1.default.throws(() => harness_1.bot.ext.classes.add({ name: "A" }, { name: "B", extends: "Nope" }), /B extends Nope, which is not defined/);
        strict_1.default.equal(await (0, harness_1.output)("$classExists[A]"), "false");
        strict_1.default.throws(() => harness_1.bot.ext.classes.add({ name: "A" }, { name: "A" }), /The class A is declared twice/);
    });
    (0, node_test_1.it)("reports code that doesn't compile when it first runs", async () => {
        harness_1.bot.ext.classes.add({ name: "Broken", methods: { run: "$getField[this" } });
        strict_1.default.match(await (0, harness_1.failure)("$new[b;Broken]$callMethod[b;run]"), /Could not compile Broken\.run/);
    });
});
(0, node_test_1.describe)("classes.load", () => {
    (0, node_test_1.it)("loads the .js files of a folder and its subfolders", async () => {
        const root = folderWith({
            "player.js": `module.exports = ${JSON.stringify({
                name: "Player",
                fields: { hp: "100" },
                methods: { hit: { params: ["n"], code: "$setField[this;hp;$math[$getField[this;hp]-$env[n]]]" } },
            })}`,
            "pets/cats.js": `exports.default = [{ name: "Cat", fields: { lives: "9" } }]`,
            "helpers.js": `const unused = 1`,
            "dog.json": JSON.stringify({ name: "Dog" }),
        });
        harness_1.bot.ext.classes.load(root);
        strict_1.default.equal(await (0, harness_1.output)("$new[p;Player]$callMethod[p;hit;30]$getField[p;hp]"), "70");
        strict_1.default.equal(await (0, harness_1.output)("$new[c;Cat]$getField[c;lives]"), "9");
        strict_1.default.equal(await (0, harness_1.output)("$classExists[Dog]"), "false", "only .js files are loaded");
    });
    (0, node_test_1.it)("names the file of a class that can't be used", () => {
        const root = folderWith({ "bad.js": `module.exports = { name: "Bad", fields: { __class: "x" } }` });
        strict_1.default.throws(() => harness_1.bot.ext.classes.load(root), /bad\.js: "__class" holds the class name/);
    });
});
(0, node_test_1.describe)("ForgeClassBuilder", () => {
    (0, node_test_1.it)("takes the same data as a plain object", async () => {
        harness_1.bot.ext.classes.add(new __1.ForgeClassBuilder({ name: "Counter", fields: { count: 0 } }));
        strict_1.default.equal(await (0, harness_1.output)("$new[c;Counter]$getField[c;count]"), "0");
    });
    (0, node_test_1.it)("is taken next to plain objects, alone or in arrays", async () => {
        harness_1.bot.ext.classes.add([new __1.ForgeClassBuilder({ name: "Dog", extends: "Animal", fields: { sound: "woof" } })], {
            name: "Animal",
            fields: { sound: "..." },
            methods: { speak: "$return[$getField[this;sound]]" },
        });
        strict_1.default.equal(await (0, harness_1.output)("$new[d;Dog]$callMethod[d;speak]"), "woof");
    });
    (0, node_test_1.it)("is loaded from a class file", async () => {
        const index = JSON.stringify((0, node_path_1.join)(__dirname, "..", "index.js"));
        const root = folderWith({
            "pets.js": `const { ForgeClassBuilder } = require(${index})\n` +
                `module.exports = [new ForgeClassBuilder({ name: "Cat", fields: { lives: 9 } }), { name: "Fish" }]`,
        });
        harness_1.bot.ext.classes.load(root);
        strict_1.default.equal(await (0, harness_1.output)("$new[c;Cat]$getField[c;lives]|$classExists[Fish]"), "9|true");
    });
    (0, node_test_1.it)("wraps a plain object when resolved, and keeps a builder as it is", () => {
        const builder = new __1.ForgeClassBuilder({ name: "A" });
        strict_1.default.equal(harness_1.bot.ext.classes.resolve(builder), builder);
        strict_1.default.ok(harness_1.bot.ext.classes.resolve({ name: "B" }) instanceof __1.ForgeClassBuilder);
    });
});
//# sourceMappingURL=files.test.js.map