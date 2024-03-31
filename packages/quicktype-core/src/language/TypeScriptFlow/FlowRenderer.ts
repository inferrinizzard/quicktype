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
        const items: string[] = [];
        this.forEachEnumCase(e, "none", (_, enumValue) => items.push(this.stringForPrimitive(enumValue)));

        if (items.length === 1) {
            this.emitLine("export type ", enumName, " =", items[0], ";");
            return;
        }

        this.emitLine("export type ", enumName, " =");
        this.indent(() => {
            const [first, ...rest] = items;
            this.emitLine(first);
            rest.forEach(item => this.emitLine("| ", item));
            this.emitItemOnce(";");
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
