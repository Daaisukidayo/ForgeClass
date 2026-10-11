import { ForgeClient } from "@tryforge/forgescript";
import { ForgeClass } from "../..";
export interface IRun {
    output: string | null;
    errors: string[];
    env: Record<string, unknown>;
}
export declare class TestBot {
    readonly ext: ForgeClass;
    readonly client: ForgeClient;
    readonly warnings: string[];
    constructor(ext?: ForgeClass);
    run(code: string, env?: Record<string, unknown>): Promise<IRun>;
}
export declare const bot: TestBot;
export declare function output(code: string, env?: Record<string, unknown>): Promise<string | null>;
export declare function failure(code: string, env?: Record<string, unknown>): Promise<string>;
export declare function json(code: string, env?: Record<string, unknown>): Promise<any>;
//# sourceMappingURL=harness.d.ts.map