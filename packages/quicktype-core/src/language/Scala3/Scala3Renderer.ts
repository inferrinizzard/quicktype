import { anyTypeIssueAnnotation, nullTypeIssueAnnotation } from "../../Annotation";
import { ConvenienceRenderer, type ForbiddenWordsInfo } from "../../ConvenienceRenderer";
import { type Name, type Namer, funPrefixNamer } from "../../Naming";
import { type RenderContext } from "../../Renderer";
import { type OptionValues } from "../../RendererOptions";
import { type Sourcelike, maybeAnnotated } from "../../Source";
import { type TargetLanguage } from "../../TargetLanguage";
import {
    ArrayType,
    type ClassProperty,
    type ClassType,
    type EnumType,
    MapType,
    type ObjectType,
    type SupportedEnumValue,
    type Type,
    type UnionType
} from "../../Type";
import { matchType, nullableFromUnion, removeNullFromUnion } from "../../TypeUtils";

import { keywords } from "./constants";
import { type scala3Options } from "./language";
import { lowerNamingFunction, scalaNameStyle, shouldAddBacktick, upperNamingFunction, wrapOption } from "./utils";

export class Scala3Renderer extends ConvenienceRenderer {
    public constructor(
        targetLanguage: TargetLanguage,
        renderContext: RenderContext,
        protected readonly _scalaOptions: OptionValues<typeof scala3Options>
    ) {
        super(targetLanguage, renderContext);
    }

    protected forbiddenNamesForGlobalNamespace(): readonly string[] {
        return keywords;
    }

    protected forbiddenForObjectProperties(_: ObjectType, _classNamed: Name): ForbiddenWordsInfo {
        return { names: [], includeGlobalForbidden: true };
    }

    protected forbiddenForEnumCases(_: EnumType, _enumName: Name): ForbiddenWordsInfo {
        return { names: [], includeGlobalForbidden: true };
    }

    protected forbiddenForUnionMembers(_u: UnionType, _unionName: Name): ForbiddenWordsInfo {
        return { names: [], includeGlobalForbidden: false };
    }

    protected topLevelNameStyle(rawName: string): string {
        return scalaNameStyle(true, rawName);
    }

    protected makeNamedTypeNamer(): Namer {
        return upperNamingFunction;
    }

    protected namerForObjectProperty(): Namer {
        return lowerNamingFunction;
    }

    protected makeUnionMemberNamer(): Namer {
        return funPrefixNamer("union", s => scalaNameStyle(true, s) + "Value");
    }

    protected makeEnumCaseNamer(): Namer {
        return funPrefixNamer("enum-cases", s => s.replace(" ", "")); // TODO - add backticks where appropriate
    }

    protected emitDescriptionBlock(lines: Sourcelike[]): void {
        this.emitCommentLines(lines, { lineStart: " * ", beforeComment: "/**", afterComment: " */" });
    }

    protected emitBlock(
        line: Sourcelike,
        f: () => void,
        delimiter: "curly" | "paren" | "lambda" | "none" = "curly"
    ): void {
        const [open, close] =
            delimiter === "curly"
                ? ["{", "}"]
                : delimiter === "paren"
                  ? ["(", ")"]
                  : delimiter === "none"
                    ? ["", ""]
                    : ["{", "})"];
        this.emitLine(line, " ", open);
        this.indent(f);
        this.emitLine(close);
    }

    protected anySourceType(optional: boolean): Sourcelike {
        return [wrapOption("Any", optional)];
    }

    // (asarazan): I've broken out the following two functions
    // because some renderers, such as kotlinx, can cope with `any`, while some get mad.
    protected arrayType(arrayType: ArrayType, withIssues = false): Sourcelike {
        return ["Seq[", this.scalaType(arrayType.items, withIssues), "]"];
    }

    protected mapType(mapType: MapType, withIssues = false): Sourcelike {
        return ["Map[String, ", this.scalaType(mapType.values, withIssues), "]"];
    }

    protected scalaType(t: Type, withIssues = false, noOptional = false): Sourcelike {
        return matchType<Sourcelike>(
            t,
            _anyType => {
                return maybeAnnotated(withIssues, anyTypeIssueAnnotation, this.anySourceType(!noOptional));
            },
            _nullType => {
                // return "None.type"
                return maybeAnnotated(withIssues, nullTypeIssueAnnotation, this.anySourceType(!noOptional));
            },
            _boolType => "Boolean",
            _integerType => "Long",
            _doubleType => "Double",
            _stringType => "String",
            arrayType => this.arrayType(arrayType, withIssues),
            classType => this.nameForNamedType(classType),
            mapType => this.mapType(mapType, withIssues),
            enumType => this.nameForNamedType(enumType),
            unionType => {
                const nullable = nullableFromUnion(unionType);
                if (nullable !== null) {
                    if (noOptional) {
                        return [this.scalaType(nullable, withIssues)];
                    } else {
                        return ["Option[", this.scalaType(nullable, withIssues), "]"];
                    }
                }

                return this.nameForNamedType(unionType);
            }
        );
    }

    protected emitUsageHeader(): void {
        // To be overridden
    }

    protected emitHeader(): void {
        if (this.leadingComments !== undefined) {
            this.emitComments(this.leadingComments);
        } else {
            this.emitUsageHeader();
        }

        this.ensureBlankLine();
        this.emitLine("package ", this._scalaOptions.packageName);
        this.ensureBlankLine();
    }

    protected emitTopLevelArray(t: ArrayType, name: Name): void {
        const elementType = this.scalaType(t.items);
        this.emitLine(["type ", name, " = List[", elementType, "]"]);
    }

    protected emitTopLevelMap(t: MapType, name: Name): void {
        const elementType = this.scalaType(t.values);
        this.emitLine(["type ", name, " = Map[String, ", elementType, "]"]);
    }

    protected emitEmptyClassDefinition(c: ClassType, className: Name): void {
        this.emitDescription(this.descriptionForType(c));
        this.emitLine("case class ", className, "()");
    }

    protected emitClassDefinition(c: ClassType, className: Name): void {
        if (c.getProperties().size === 0) {
            this.emitEmptyClassDefinition(c, className);
            return;
        }

        const scalaType = (p: ClassProperty): Sourcelike => {
            if (p.isOptional) {
                return ["Option[", this.scalaType(p.type, true, true), "]"];
            } else {
                return this.scalaType(p.type, true);
            }
        };

        this.emitDescription(this.descriptionForType(c));
        this.emitLine("case class ", className, " (");
        this.indent(() => {
            let count = c.getProperties().size;
            let first = true;
            this.forEachClassProperty(c, "none", (_, jsonName, p) => {
                const nullable = p.type.kind === "union" && nullableFromUnion(p.type as UnionType) !== null;
                const nullableOrOptional = p.isOptional || p.type.kind === "null" || nullable;
                const last = --count === 0;
                const meta: Array<() => void> = [];

                const description = this.descriptionForClassProperty(c, jsonName);
                if (description !== undefined) {
                    meta.push(() => this.emitDescription(description));
                }

                if (meta.length > 0 && !first) {
                    this.ensureBlankLine();
                }

                for (const emit of meta) {
                    emit();
                }

                const nameNeedsBackticks = jsonName.endsWith("_") || shouldAddBacktick(jsonName);
                const nameWithBackticks = nameNeedsBackticks ? "`" + jsonName + "`" : jsonName;
                this.emitLine(
                    "val ",
                    nameWithBackticks,
                    " : ",
                    scalaType(p),
                    p.isOptional ? " = None" : nullableOrOptional ? " = None" : "",
                    last ? "" : ","
                );

                if (meta.length > 0 && !last) {
                    this.ensureBlankLine();
                }

                first = false;
            });
        });

        this.emitClassDefinitionMethods();
    }

    protected emitClassDefinitionMethods(): void {
        this.emitLine(")");
    }

    protected stringForPrimitive(value: SupportedEnumValue): string {
        const needsBackticks = typeof value !== "string" || shouldAddBacktick(value) || value.includes(" ");

        if (needsBackticks) {
            return "`" + `${value}` + "`";
        }

        return `${value}`;
    }

    protected emitEnumDefinition(e: EnumType, enumName: Name): void {
        // FIXME: add option for Enumeration class
        this.emitDescription(this.descriptionForType(e));

        if ([...e.cases.values()].some(enumCase => enumCase !== "string")) {
            this.emitLine("type ", enumName, " = ");
            this.forEachEnumCase(e, "none", (_, enumValue, position) => {
                if (position === "first") {
                    this.emitItem(this.stringForPrimitive(enumValue));
                } else {
                    this.emitItem([" | ", this.stringForPrimitive(enumValue)]);
                }
            });
        } else {
            this.emitBlock(
                ["enum ", enumName, " : "],
                () => {
                    this.forEachEnumCase(e, "none", (_, enumValue) => {
                        this.emitLine("case ", this.stringForPrimitive(enumValue));
                    });
                },
                "none"
            );
        }
    }

    protected emitUnionDefinition(u: UnionType, unionName: Name): void {
        function sortBy(t: Type): string {
            const kind = t.kind;
            if (kind === "class") return kind;
            return "_" + kind;
        }

        this.emitDescription(this.descriptionForType(u));

        const [maybeNull, nonNulls] = removeNullFromUnion(u, sortBy);
        const theTypes: Sourcelike[] = [];
        this.forEachUnionMember(u, nonNulls, "none", null, (_, t) => {
            theTypes.push(this.scalaType(t));
        });
        if (maybeNull !== null) {
            theTypes.push(this.nameForUnionMember(u, maybeNull));
        }

        this.emitItem(["type ", unionName, " = "]);
        theTypes.forEach((t, i) => {
            this.emitItem(i === 0 ? t : [" | ", t]);
        });
        this.ensureBlankLine();
    }

    protected emitSourceStructure(): void {
        this.emitHeader();

        // Top-level arrays, maps
        this.forEachTopLevel("leading", (t, name) => {
            if (t instanceof ArrayType) {
                this.emitTopLevelArray(t, name);
            } else if (t instanceof MapType) {
                this.emitTopLevelMap(t, name);
            }
        });

        this.forEachNamedType(
            "leading-and-interposing",
            (c: ClassType, n: Name) => this.emitClassDefinition(c, n),
            (e, n) => this.emitEnumDefinition(e, n),
            (u, n) => this.emitUnionDefinition(u, n)
        );
    }
}
