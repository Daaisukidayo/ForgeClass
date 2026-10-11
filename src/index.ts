import { ForgeClient, ForgeExtension } from "@tryforge/forgescript"
import { ClassManager } from "./managers"
import { description, version } from "../package.json"
import path from "path"

declare module "@tryforge/forgescript" {
    interface ForgeClient {
        classes: ClassManager
    }
}

export class ForgeClass extends ForgeExtension {
    name = "ForgeClass"
    description = description
    version = version

    public readonly classes = new ClassManager()

    public static of(client: ForgeClient) {
        return client.getExtension(ForgeClass, true)
    }

    public init(client: ForgeClient) {
        this.load(path.resolve(__dirname, "native"))
        client.classes = this.classes
    }
}

export * from "./managers"
export * from "./structures"
export * from "./types"
