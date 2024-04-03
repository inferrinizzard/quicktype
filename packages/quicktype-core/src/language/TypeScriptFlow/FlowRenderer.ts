import { type Name } from "../../Naming";
import { type ClassType, type EnumType } from "../../Type";
import { type JavaScriptTypeAnnotations } from "../JavaScript";

import { TypeScriptFlowBaseRenderer } from "./TypeScriptFlowBaseRenderer";
import { tsFlowTypeAnnotations } from "./utils";

export class FlowRenderer extends TypeScriptFlowBaseRenderer {
    protected forbiddenNamesForGlobalNamespace(): string[] {
        return ["Class", "Date", "Object", "String", "Array", "JSON", "Error"];
    }

    protected get typeAnnotations(): JavaScriptTypeAnnotations {
        return Object.assign({ never: "" }, tsFlowTypeAnnotations);
    }

    protected emitEnum(e: EnumType, enumName: Name): void {
        this.emitDescription(this.descriptionForType(e));
        if (e.cases.size === 1) {
            this.emitLine("export type ", enumName, " = ", this.stringForPrimitive(e.cases.values().next().value), ";");
            return;
        }

        this.emitLine("export type ", enumName, " =");
        this.indent(() => {
            this.forEachEnumCase(e, "none", (_, enumValue, position) => {
                const item = this.stringForPrimitive(enumValue);

                if (position === "first") {
                    this.emitLine(item);
                } else if (position === "last") {
                    this.emitLine("| ", item, ";");
                } else {
                    this.emitLine("| ", item);
                }
            });
        });
    }

    protected emitClassBlock(c: ClassType, className: Name): void {
        this.emitBlock(["export type ", className, " = "], ";", () => {
            this.emitClassBlockBody(c);
        });
    }

    protected emitSourceStructure(): void {
        this.emitLine("// @flow");
        this.ensureBlankLine();
        super.emitSourceStructure();
    }
}
