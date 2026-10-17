import { ForgeClient, ForgeExtension } from "@tryforge/forgescript"
import { ClassManager } from "./managers"
import { description, version } from "../package.json"
import path from "path"

declare module "@tryforge/forgescript" {
    interface ForgeClient {
        /** The classes, set by ForgeClass. */
        classes: ClassManager
    }
}

export class ForgeClass extends ForgeExtension {
    name = "ForgeClass"
    description = description
    version = version

    /** The class registry, also at `client.classes`. */
    public readonly classes = new ClassManager()

    /** The ForgeClass of a client. Throws when it isn't in the extensions. */
    public static of(client: ForgeClient) {
        return client.getExtension(ForgeClass, true)
    }

    /** Loads the functions and sets `client.classes`. */
    public init(client: ForgeClient) {
        this.load(path.resolve(__dirname, "native"))
        client.classes = this.classes
    }
}

export * from "./managers"
export * from "./structures"
export * from "./types"
export type { Access } from "./functions/declaration"
export type { Result } from "./functions/result"
