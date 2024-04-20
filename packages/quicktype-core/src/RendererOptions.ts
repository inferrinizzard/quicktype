import { assert } from "./support/Support";
import { messageError } from "./Messages";
import { hasOwnProperty } from "collection-utils";

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
    multiple?: boolean;
    defaultOption?: boolean;
    defaultValue?: T;
    typeLabel?: string;
}

/**
 * The superclass for target language options.  You probably want to use one of its
 * subclasses, `BooleanOption`, `EnumOption`, or `StringOption`.
 */
export abstract class Option<Name extends string, T> {
    readonly definition: OptionDefinition<Name, T>;

    constructor(definition: OptionDefinition<Name, T>) {
        definition.renderer = true;
        this.definition = definition;
        assert(definition.kind !== undefined, "Renderer option kind must be defined");
    }

    getValue(values: Record<string, unknown>): T {
        return (values[this.name] ?? this.definition.defaultValue) as T;
    }

    get name(): Name {
        return this.definition.name;
    }

    get cliDefinitions(): { display: OptionDefinition<Name, T>[]; actual: OptionDefinition<Name, T>[] } {
        return { actual: [this.definition], display: [this.definition] };
    }
}

export type OptionValueType<O> = O extends Option<infer Name, infer T> ? T : never;
export type OptionValues<T> = { [P in keyof T]: OptionValueType<T[P]> };

export function getOptionValues<Name extends string, T, Options extends Record<string, Option<Name, T>>>(
    options: Options,
    untypedOptionValues: { [name: string]: any }
): OptionValues<Options> {
    const optionValues: { [name: string]: any } = {};
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
    constructor(name: Name, description: string, defaultValue: boolean, kind: OptionKind = "primary") {
        super({
            name,
            kind,
            type: Boolean,
            description,
            defaultValue
        });
    }

    get cliDefinitions(): { display: OptionDefinition<Name, boolean>[]; actual: OptionDefinition<Name, boolean>[] } {
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

    getValue(values: Record<string, unknown>): boolean {
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
    constructor(
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

export class EnumOption<
    Name extends string,
    EnumMap extends Record<string, unknown>,
    EnumKey = keyof EnumMap
> extends Option<Name, EnumKey> {
    private readonly _values: EnumMap;

    constructor(
        name: Name,
        description: string,
        values: EnumMap,
        defaultValue: NoInfer<EnumKey>,
        kind: OptionKind = "primary"
    ) {
        const definition = {
            name,
            kind,
            type: String,
            description,
            typeLabel: Object.keys(values).join("|"),
            defaultValue
        };
        super(definition);

        this._values = values;
    }

    getEnumValue<Key extends EnumKey & string>(name: Key): EnumMap[Key] {
        if (!hasOwnProperty(this._values, name)) {
            return messageError("RendererUnknownOptionValue", { value: name, name: this.name });
        }
        return this._values[name];
    }
}
