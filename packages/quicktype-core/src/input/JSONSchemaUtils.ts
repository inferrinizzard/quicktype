// TODO: refactor JSONSchemaInput and move this into utils.ts

// eslint-disable-next-line import/no-cycle
import { type JSONSchemaType, schemaTypeDict } from "./JSONSchemaInput";

export const findJsonSchemaPrimitiveType = (
    value?: unknown
): Exclude<JSONSchemaType, "object" | "array"> | undefined => {
    if (value === null) {
        return "null";
    }

    if (typeof value === "bigint" || (typeof value === "number" && value === Math.floor(value))) {
        return "integer";
    }

    if ((typeof value) in schemaTypeDict) {
        return typeof value as Exclude<JSONSchemaType, "object" | "array">;
    }

    // if value is not a primitive type like above, it will be skipped
    return undefined;
};
