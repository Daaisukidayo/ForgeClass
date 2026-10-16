import { ForgeClient, ForgeExtension } from "@tryforge/forgescript";
import { ClassManager } from "./managers";
declare module "@tryforge/forgescript" {
    interface ForgeClient {
        /** The classes, set by ForgeClass. */
        classes: ClassManager;
    }
}
export declare class ForgeClass extends ForgeExtension {
    name: string;
    description: string;
    version: string;
    /** The class registry, also at `client.classes`. */
    readonly classes: ClassManager;
    /** The ForgeClass of a client. Throws when it isn't in the extensions. */
    static of(client: ForgeClient): ForgeClass;
    /** Loads the functions and sets `client.classes`. */
    init(client: ForgeClient): void;
}
export * from "./managers";
export * from "./structures";
export * from "./types";
export type { Access } from "./functions/declaration";
export type { Result } from "./functions/result";
//# sourceMappingURL=index.d.ts.map