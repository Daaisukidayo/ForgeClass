"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = exports.TestBot = void 0;
exports.output = output;
exports.failure = failure;
exports.json = json;
const strict_1 = __importDefault(require("node:assert/strict"));
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("../..");
let nativesLoaded = false;
/** A client stub with ForgeClass that runs code without Discord. */
class TestBot {
    ext;
    client;
    /** Warnings logged while loading, apart from function overrides. */
    warnings = [];
    constructor(ext = new __1.ForgeClass()) {
        this.ext = ext;
        this.client = {
            options: { extensions: [ext] },
            canRespondToBots: () => true,
            getExtension: () => ext,
        };
        const warn = forgescript_1.Logger.warn;
        forgescript_1.Logger.warn = (...args) => {
            const text = args.map(String).join(" ");
            if (!text.includes("Attempted to override"))
                this.warnings.push(text);
        };
        try {
            ext.init(this.client);
            if (!nativesLoaded) {
                forgescript_1.FunctionManager.loadNative();
                nativesLoaded = true;
            }
        }
        finally {
            forgescript_1.Logger.warn = warn;
        }
    }
    /** Runs code and collects the errors it logs. */
    async run(code, env = {}) {
        const errors = [];
        const error = forgescript_1.Logger.error;
        forgescript_1.Logger.error = (...args) => void errors.push(args.map(String).join(" "));
        try {
            const output = await forgescript_1.Interpreter.run(new forgescript_1.Context({
                client: this.client,
                data: forgescript_1.Compiler.compile(code),
                command: null,
                obj: {},
                doNotSend: true,
                redirectErrorsToConsole: true,
                environment: env,
            }));
            return { output, errors, env };
        }
        finally {
            forgescript_1.Logger.error = error;
        }
    }
}
exports.TestBot = TestBot;
/** The bot the tests share. */
exports.bot = new TestBot();
/** Runs code that must succeed. Returns its output. */
async function output(code, env) {
    const run = await exports.bot.run(code, env);
    strict_1.default.deepEqual(run.errors, [], `${code} failed`);
    return run.output;
}
/** Runs code that must fail with exactly one error. Returns its message. */
async function failure(code, env) {
    const run = await exports.bot.run(code, env);
    strict_1.default.equal(run.errors.length, 1, `${code} was expected to fail`);
    strict_1.default.equal(run.output, null, "a failed command sends nothing");
    return run.errors[0];
}
/** Runs code that must succeed and parses its output as JSON. */
async function json(code, env) {
    return JSON.parse((await output(code, env)) ?? "null");
}
//# sourceMappingURL=harness.js.map