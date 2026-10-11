import { ForgeClient, ForgeExtension } from "@tryforge/forgescript";
import { ClassManager } from "./managers";
declare module "@tryforge/forgescript" {
    interface ForgeClient {
        classes: ClassManager;
    }
}
export declare class ForgeClass extends ForgeExtension {
    name: string;
    description: string;
    version: string;
    readonly classes: ClassManager;
    static of(client: ForgeClient): ForgeClass;
    init(client: ForgeClient): void;
}
export * from "./managers";
export * from "./structures";
export * from "./types";
//# sourceMappingURL=index.d.ts.map