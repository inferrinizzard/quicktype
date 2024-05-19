// eslint-disable-next-line @typescript-eslint/no-redeclare
import { hasOwnProperty } from "collection-utils";

import { messageError } from "./Messages";
import { assert } from "./support/Support";
import { type FixMeOptionsAnyType, type FixMeOptionsType } from "./types";

/**
 * Primary options show up in the web UI in the "Language" settings tab,
 * secondary options in "Other".
 */
export type OptionKind = "primary" | "secondary";

export interface OptionDefinition<Name extends string, T> {
    name: Name;
    description: string;
    type: StringConstructor | BooleanConstructor;
    kind?: OptionKind;
    renderer?: boolean;
    alias?: string;
    defaultOption?: boolean;
    defaultValue?: T;
    legalValues?: string[];
    multiple?: boolean;
    typeLabel?: string;
}

/**
 * The superclass for target language options.  You probably want to use one of its
 * subclasses, `BooleanOption`, `EnumOption`, or `StringOption`.
 */
export abstract class Option<Name extends string, T> {
    protected readonly definition: OptionDefinition<Name, T>;

    public constructor(definition: OptionDefinition<Name, T>) {
        definition.renderer = true;
        this.definition = definition;
        assert(definition.kind !== undefined, "Renderer option kind must be defined");
    }

    public get name(): Name {
        return this.definition.name;
    }

    public getValue(values: Record<string, unknown>): T {
        return (values[this.name] ?? this.definition.defaultValue) as T;
    }

    public get cliDefinitions(): {
        actual: Array<OptionDefinition<Name, T>>;
        display: Array<OptionDefinition<Name, T>>;
    } {
        return { actual: [this.definition], display: [this.definition] };
    }
}

export type OptionValueType<O> = O extends Option<infer Name, infer T> ? T : never;
export type OptionValues<T> = { [P in keyof T]: OptionValueType<T[P]> };

export function getOptionValues<Name extends string, T, Options extends Record<string, Option<Name, T>>>(
    options: Options,
    untypedOptionValues: FixMeOptionsType
): OptionValues<Options> {
    const optionValues: FixMeOptionsType = {};
    for (const name of Object.getOwnPropertyNames(options)) {
        const option = options[name];
        const value = option.getValue(untypedOptionValues);
        if (option instanceof EnumOption) {
            optionValues[name] = option.getEnumValue(value);
        } else {
            optionValues[name] = value;
        }
    }

    return optionValues as OptionValues<Options>;
}

/**
 * A target language option that allows setting a boolean flag.
 */
export class BooleanOption<Name extends string> extends Option<Name, boolean> {
    /**
     * @param name The shorthand name.
     * @param description Short-ish description of the option.
     * @param defaultValue The default value.
     * @param kind Whether it's a primary or secondary option.
     */
    public constructor(name: Name, description: string, defaultValue: boolean, kind: OptionKind = "primary") {
        super({
            name,
            kind,
            type: Boolean,
            description,
            defaultValue
        });
    }

    public get cliDefinitions(): {
        actual: Array<OptionDefinition<Name, boolean>>;
        display: Array<OptionDefinition<Name, boolean>>;
    } {
        const negated = Object.assign({}, this.definition, {
            name: `no-${this.name}`,
            defaultValue: !this.definition.defaultValue
        });
        const display = Object.assign({}, this.definition, {
            name: `[no-]${this.name}`,
            description: `${this.definition.description} (${this.definition.defaultValue ? "on" : "off"} by default)`
        });
        return {
            display: [display],
            actual: [this.definition, negated]
        };
    }

    public getValue(values: Record<string, unknown>): boolean {
        let value = values[this.name];
        if (value === undefined) {
            value = this.definition.defaultValue;
        }

        let negated = values[`no-${this.name}`];
        if (negated === undefined) {
            negated = !this.definition.defaultValue;
        }

        if (value === "true") {
            value = true;
        } else if (value === "false") {
            value = false;
        }

        if (this.definition.defaultValue) {
            return (value && !negated) as boolean;
        } else {
            return (value || !negated) as boolean;
        }
    }
}

export class StringOption<Name extends string> extends Option<Name, string> {
    public constructor(
        name: Name,
        description: string,
        typeLabel: string,
        defaultValue: string,
        kind: OptionKind = "primary"
    ) {
        const definition = {
            name,
            kind,
            type: String,
            description,
            typeLabel,
            defaultValue
        };
        super(definition);
    }
}

type NoInfer<T> = [T][T extends any ? 0 : never];

// FIXME: remove tuples and use map
export class EnumOption<
    Name extends string,
    // EnumMap extends Record<string, unknown>,
    // EnumKey = keyof EnumMap
    EnumTuples extends Array<[string, unknown]>,
    EnumKey = EnumTuples[number][0],
    EnumMap = { [Key in EnumTuples[number][0]]: Extract<EnumTuples[number], [Key, any]>[1] }
> extends Option<Name, EnumKey> {
    private readonly _values: EnumMap;

    public constructor(
        name: Name,
        description: string,
        // values: EnumMap,
        values: EnumTuples,
        defaultValue: NoInfer<EnumKey>,
        kind: OptionKind = "primary"
    ) {
        const definition = {
            name,
            kind,
            type: String,
            description,
            // typeLabel: Object.keys(values).join("|"),
            typeLabel: values.map(([key, _]) => key).join("|"),
            defaultValue
        };
        super(definition);

        // this._values = values;
        this._values = values.reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {} as Partial<EnumMap>) as EnumMap;
    }

    // getEnumValue<Key extends EnumKey & string>(name: Key): EnumMap[Key] {
    public getEnumValue<Key extends keyof EnumMap & string>(name: Key): EnumMap[Key] {
        if (!hasOwnProperty(this._values, name)) {
            return messageError("RendererUnknownOptionValue", { value: name, name: this.name });
        }

        return this._values[name];
    }
}
