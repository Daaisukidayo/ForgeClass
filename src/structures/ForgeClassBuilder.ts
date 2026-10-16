import { IClassData } from "../types"

/** A class for a class file or `client.classes.add()`, the way `ForgeFunction` is for functions. */
export class ForgeClassBuilder {
    public constructor(public readonly data: IClassData) {}
}
