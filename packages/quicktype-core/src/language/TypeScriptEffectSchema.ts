import { arrayIntercalate } from "collection-utils";
import { type ClassProperty, type ObjectType, type Type } from "../Type";
import { ArrayType, EnumType, MapType } from "../Type";
import { matchType } from "../TypeUtils";
import { type Name, type Namer } from "../Naming";
import { funPrefixNamer } from "../Naming";
import { type RenderContext } from "../Renderer";
import { type Option, type OptionValues } from "../RendererOptions";
import { BooleanOption, getOptionValues } from "../RendererOptions";
import { acronymStyle, AcronymStyleOptions } from "../support/Acronyms";
import {
    allLowerWordStyle,
    capitalize,
    combineWords,
    firstUpperWordStyle,
    isLetterOrUnderscore,
    splitIntoWords,
    stringEscape,
    utf16StringEscape,
} from "../support/Strings";
import { TargetLanguage } from "../TargetLanguage";
import { legalizeName } from "./JavaScript";
import { type Sourcelike } from "../Source";
import { panic } from "../support/Support";
import { ConvenienceRenderer } from "../ConvenienceRenderer";

export const typeScriptEffectSchemaOptions = {
    justSchema: new BooleanOption("just-schema", "Schema only", false),
};

export class TypeScriptEffectSchemaTargetLanguage extends TargetLanguage {
    protected getOptions (): Array<Option<any>> {
        return [];
    }

    constructor (
        displayName: string = "TypeScript Effect Schema",
        names: string[] = ["typescript-effect-schema"],
        extension: string = "ts",
    ) {
        super(displayName, names, extension);
    }

    protected makeRenderer (
        renderContext: RenderContext,
        untypedOptionValues: { [name: string]: any, },
    ): TypeScriptEffectSchemaRenderer {
        return new TypeScriptEffectSchemaRenderer(
            this,
            renderContext,
            getOptionValues(typeScriptEffectSchemaOptions, untypedOptionValues),
        );
    }
}

export class TypeScriptEffectSchemaRenderer extends ConvenienceRenderer {
    constructor (
        targetLanguage: TargetLanguage,
        renderContext: RenderContext,
        private readonly _options: OptionValues<typeof typeScriptEffectSchemaOptions>,
    ) {
        super(targetLanguage, renderContext);
    }

    protected forbiddenNamesForGlobalNamespace (): string[] {
        return ["Class", "Date", "Object", "String", "Array", "JSON", "Error"];
    }

    protected nameStyle (original: string, upper: boolean): string {
        const acronyms = acronymStyle(AcronymStyleOptions.Camel);
        const words = splitIntoWords(original);
        return combineWords(
            words,
            legalizeName,
            upper ? firstUpperWordStyle : allLowerWordStyle,
            firstUpperWordStyle,
            upper ? s => capitalize(acronyms(s)) : allLowerWordStyle,
            acronyms,
            "",
            isLetterOrUnderscore,
        );
    }

    protected makeNamedTypeNamer (): Namer {
        return funPrefixNamer("types", s => this.nameStyle(s, true));
    }

    protected makeUnionMemberNamer (): Namer {
        return funPrefixNamer("properties", s => this.nameStyle(s, true));
    }

    protected namerForObjectProperty (): Namer {
        return funPrefixNamer("properties", s => this.nameStyle(s, true));
    }

    protected makeEnumCaseNamer (): Namer {
        return funPrefixNamer("enum-cases", s => this.nameStyle(s, false));
    }

    private importStatement (lhs: Sourcelike, moduleName: Sourcelike): Sourcelike {
        return ["import ", lhs, " from ", moduleName, ";"];
    }

    protected emitImports (): void {
        this.ensureBlankLine();
        this.emitLine(this.importStatement("* as S", "\"@effect/schema/Schema\""));
    }

    typeMapTypeForProperty (p: ClassProperty): Sourcelike {
        const typeMap = this.typeMapTypeFor(p.type);
        return p.isOptional ? ["S.optional(", typeMap, ")"] : typeMap;
    }

    emittedObjects = new Set<Name>();

    typeMapTypeFor (t: Type, required: boolean = true): Sourcelike {
        if (t.kind === "class" || t.kind === "object" || t.kind === "enum") {
            const name = this.nameForNamedType(t);
            if (this.emittedObjects.has(name)) {
                return [name];
            }

            return ["S.suspend(() => ", name, ")"];
        }

        const match = matchType<Sourcelike>(
            t,
            _anyType => "S.any",
            _nullType => "S.null",
            _boolType => "S.boolean",
            _integerType => "S.number",
            _doubleType => "S.number",
            _stringType => "S.string",
            arrayType => ["S.array(", this.typeMapTypeFor(arrayType.items, false), ")"],
            _classType => panic("Should already be handled."),
            _mapType => ["S.record(S.string, ", this.typeMapTypeFor(_mapType.values, false), ")"],
            _enumType => panic("Should already be handled."),
            unionType => {
                const children = Array.from(unionType.getChildren()).map((type: Type) =>
                    this.typeMapTypeFor(type, false),
                );
                return ["S.union(", ...arrayIntercalate(", ", children), ")"];
            },
            _transformedStringType => {
                return "S.string";
            },
        );

        if (required) {
            return [match];
        }

        return match;
    }

    private emitObject (name: Name, t: ObjectType) {
        this.emittedObjects.add(name);
        this.ensureBlankLine();
        this.emitLine("\nexport class ", name, " extends S.Class<", name, ">(\"", name, "\")({");
        this.indent(() => {
            this.forEachClassProperty(t, "none", (_, jsonName, property) => {
                this.emitLine(`"${utf16StringEscape(jsonName)}"`, ": ", this.typeMapTypeForProperty(property), ",");
            });
        });
        this.emitLine("}) {}");
    }

    private emitEnum (e: EnumType, enumName: Name): void {
        this.emittedObjects.add(enumName);
        this.ensureBlankLine();
        this.emitDescription(this.descriptionForType(e));
        this.emitLine("\nexport const ", enumName, " = ", "S.literal(");
        this.indent(() =>
            this.forEachEnumCase(e, "none", (_, jsonName) => {
                this.emitLine("\"", stringEscape(jsonName), "\",");
            }),
        );
        this.emitLine(");");
        if (!this._options.justSchema) {
            this.emitLine("export type ", enumName, " = S.Schema.Type<typeof ", enumName, ">;");
        }
    }

    protected walkObjectNames (type: ObjectType) {
        const names: Name[] = [];

        const recurse = (type: Type) => {
            if (type.kind === "object" || type.kind === "class") {
                names.push(this.nameForNamedType(type));
                this.forEachClassProperty(type as ObjectType, "none", (_, __, prop) => {
                    recurse(prop.type);
                });
            } else if (type instanceof ArrayType) {
                recurse(type.items);
            } else if (type instanceof MapType) {
                recurse(type.values);
            } else if (type instanceof EnumType) {
                for (const t of type.getChildren()) {
                    recurse(t);
                }
            }
        };

        this.forEachClassProperty(type, "none", (_, __, prop) => {
            recurse(prop.type);
        });

        return names;
    }

    protected emitSchemas (): void {
        this.ensureBlankLine();

        this.forEachEnum("leading-and-interposing", (u: EnumType, enumName: Name) => {
            this.emitEnum(u, enumName);
        });

        const order: number[] = [];
        const mapKey: Name[] = [];
        const mapValue: ObjectType[] = [];
        this.forEachObject("none", (type: ObjectType, name: Name) => {
            mapKey.push(name);
            mapValue.push(type);
        });

        mapKey.forEach((_, index) => {
            // assume first
            let ordinal = 0;

            // pull out all names
            const source = mapValue[index];
            const names = this.walkObjectNames(source);

            // must be behind all these names
            for (let i = 0; i < names.length; i++) {
                const depName = names[i];

                // find this name's ordinal, if it has already been added
                for (let j = 0; j < order.length; j++) {
                    const depIndex = order[j];
                    if (mapKey[depIndex] === depName) {
                        // this is the index of the dependency, so make sure we come after it
                        ordinal = Math.max(ordinal, depIndex + 1);
                    }
                }
            }

            // insert index
            order.splice(ordinal, 0, index);
        });

        // now emit ordered source
        order.forEach(i => this.emitGatheredSource(this.gatherSource(() => this.emitObject(mapKey[i], mapValue[i]))));
    }

    protected emitSourceStructure (): void {
        if (this.leadingComments !== undefined) {
            this.emitComments(this.leadingComments);
        }

        this.emitImports();
        this.emitSchemas();
    }
}
