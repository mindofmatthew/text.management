export interface SettingsSchema {
  [name: string]: ValueSchema;
}

type ValueSchema =
  | NumberValueSchema
  | StringValueSchema
  | BooleanValueSchema
  | ArrayValueSchema;

interface NumberValueSchema extends BaseValueSchema {
  type: "number";
  default?: number;
}

interface StringValueSchema extends BaseValueSchema {
  type: "string";
  default?: string;
}

interface BooleanValueSchema extends BaseValueSchema {
  type: "boolean";
  default?: boolean;
}

type PrimitiveValueSchema =
  | NumberValueSchema
  | StringValueSchema
  | BooleanValueSchema;

interface ArrayValueSchema extends BaseValueSchema {
  type: "array";
  items: PrimitiveValueSchema;
}

interface BaseValueSchema {}

export { FromSchema } from "json-schema-to-ts";
import { FromSchema } from "json-schema-to-ts";

// export type FromSchema<S extends SettingsSchema> = {
//   [Property in keyof S]: S[Property] extends NumberValueSchema
//     ? number
//     : S[Property] extends StringValueSchema
//     ? string
//     : S[Property] extends BooleanValueSchema
//     ? boolean
//     : S[Property] extends ArrayValueSchema
//     ? FromArraySchema<S[Property]>
//     : never;
// };

// type FromArraySchema<S extends ArrayValueSchema> =
//   S["items"] extends NumberValueSchema
//     ? number[]
//     : S["items"] extends StringValueSchema
//     ? string[]
//     : S["items"] extends BooleanValueSchema
//     ? boolean[]
//     : never;

export function getDefaults<S extends SettingsSchema>(
  schema: S
): FromSchema<S> {
  const defaults: any = {};

  for (let key in schema) {
    let valueOptions = schema[key];

    switch (valueOptions.type) {
      case "number":
        defaults[key] = valueOptions.default ?? 0;
        break;
      case "string":
        defaults[key] = valueOptions.default ?? "";
        break;
      case "boolean":
        defaults[key] = valueOptions.default ?? false;
        break;
      case "array":
        defaults[key] = [];
        break;
    }
  }

  return defaults;
}

export function getValid<S extends SettingsSchema>(
  schema: S,
  data: any
): Partial<FromSchema<S>> {
  const validData: any = {};

  function getValidPrimitive(schema: PrimitiveValueSchema, value: any) {
    if (schema.type === "number" && typeof value === "number") {
      return value;
    } else if (schema.type === "string" && typeof value === "string") {
      return value;
    } else if (schema.type === "boolean" && typeof value === "boolean") {
      return value;
    }
  }

  if (typeof data === "object") {
    for (let key in data) {
      if (key in schema) {
        if (
          schema[key].type === "number" ||
          schema[key].type === "string" ||
          schema[key].type === "boolean"
        ) {
          const value = getValidPrimitive(
            schema[key] as PrimitiveValueSchema,
            data[key]
          );
          if (value !== undefined) {
            validData[key] = value;
          }
        } else if (schema[key].type === "array") {
          const value = data[key];
          if (Array.isArray(value)) {
            const arraySchema = (schema[key] as ArrayValueSchema).items;
            validData[key] = value.filter((v) =>
              getValidPrimitive(arraySchema, v)
            );
          }
        }
      }
    }
  }

  return validData;
}
