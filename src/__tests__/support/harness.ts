import assert from "node:assert/strict"
import { Compiler, Context, ForgeClient, FunctionManager, Interpreter, Logger } from "@tryforge/forgescript"
import { ForgeClass } from "../.."

export interface IRun {
    output: string | null

    errors: string[]

    env: Record<string, unknown>
}

let nativesLoaded = false

export class TestBot {
    public readonly client: ForgeClient

    public readonly warnings: string[] = []

    public constructor(public readonly ext = new ForgeClass()) {
        this.client = {
            options: { extensions: [ext] },
            canRespondToBots: () => true,
            getExtension: () => ext,
        } as unknown as ForgeClient

        const warn = Logger.warn

        Logger.warn = (...args: unknown[]) => {
            const text = args.map(String).join(" ")
            if (!text.includes("Attempted to override")) this.warnings.push(text)
        }

        try {
            ext.init(this.client)

            if (!nativesLoaded) {
                FunctionManager.loadNative()
                nativesLoaded = true
            }
        } finally {
            Logger.warn = warn
        }
    }

    public async run(code: string, env: Record<string, unknown> = {}): Promise<IRun> {
        const errors: string[] = []
        const error = Logger.error

        Logger.error = (...args: unknown[]) => void errors.push(args.map(String).join(" "))

        try {
            const output = await Interpreter.run(
                new Context({
                    client: this.client,
                    data: Compiler.compile(code),
                    command: null,
                    obj: {},
                    doNotSend: true,
                    redirectErrorsToConsole: true,
                    environment: env,
                } as never)
            )

            return { output, errors, env }
        } finally {
            Logger.error = error
        }
    }
}

export const bot = new TestBot()

export async function output(code: string, env?: Record<string, unknown>) {
    const run = await bot.run(code, env)
    assert.deepEqual(run.errors, [], `${code} failed`)

    return run.output
}

export async function failure(code: string, env?: Record<string, unknown>) {
    const run = await bot.run(code, env)
    assert.equal(run.errors.length, 1, `${code} was expected to fail`)
    assert.equal(run.output, null, "a failed command sends nothing")

    return run.errors[0]
}

export async function json(code: string, env?: Record<string, unknown>) {
    return JSON.parse((await output(code, env)) ?? "null")
}
