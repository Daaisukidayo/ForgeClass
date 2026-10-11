export const CLASS_KEY = "__class"

export interface IInstance {
    [CLASS_KEY]: string
    [field: string]: unknown
}

export function isInstance(value: unknown): value is IInstance {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        typeof (value as Record<string, unknown>)[CLASS_KEY] === "string"
    )
}

export function fieldsOf(instance: IInstance): Record<string, unknown> {
    const fields: Record<string, unknown> = { ...instance }
    delete fields[CLASS_KEY]

    return fields
}
