/** The instance field that holds its class name. */
export const CLASS_KEY = "__class"

/** An instance: a plain object with its class name and fields, except `#` ones. */
export interface IInstance {
    [CLASS_KEY]: string
    [field: string]: unknown
}

/** Whether the value is an instance, of a declared class or not. */
export function isInstance(value: unknown): value is IInstance {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        typeof (value as Record<string, unknown>)[CLASS_KEY] === "string"
    )
}

/** A copy of the fields, without `__class`. */
export function fieldsOf(instance: IInstance): Record<string, unknown> {
    const fields: Record<string, unknown> = { ...instance }
    delete fields[CLASS_KEY]

    return fields
}
