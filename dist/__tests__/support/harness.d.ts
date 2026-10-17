import { ForgeClient } from "@tryforge/forgescript";
import { ForgeClass } from "../..";
/** What a run gave. */
export interface IRun {
    /** Null when the code failed. */
    output: string | null;
    /** Every error logged. */
    errors: string[];
    /** The env after the run. */
    env: Record<string, unknown>;
}
/** A client stub with ForgeClass that runs code without Discord. */
export declare class TestBot {
    readonly ext: ForgeClass;
    readonly client: ForgeClient;
    /** Warnings logged while loading, apart from function overrides. */
    readonly warnings: string[];
    constructor(ext?: ForgeClass);
    /** Runs code and collects the errors it logs. */
    run(code: string, env?: Record<string, unknown>): Promise<IRun>;
}
/** The bot the tests share. */
export declare const bot: TestBot;
/** Runs code that must succeed. Returns its output. */
export declare function output(code: string, env?: Record<string, unknown>): Promise<string | null>;
/** Runs code that must fail with exactly one error. Returns its message. */
export declare function failure(code: string, env?: Record<string, unknown>): Promise<string>;
/** Runs code that must succeed and parses its output as JSON. */
export declare function json(code: string, env?: Record<string, unknown>): Promise<any>;
//# sourceMappingURL=harness.d.ts.map