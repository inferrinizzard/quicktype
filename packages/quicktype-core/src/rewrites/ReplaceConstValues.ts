import { type RunContext } from "../Run";
import { PrimitiveType } from "../Type";
import { TypeGraph, type TypeRef } from "../TypeGraph";
import { GraphRewriteBuilder } from "../GraphRewriting";
import { constValueTypeAttributeKind } from "../attributes/ConstValue";
import { assert } from "@glideapps/ts-necessities";
import { emptyTypeAttributes } from "../attributes/TypeAttributes";

export const replaceConstValues = (ctx: RunContext, graph: TypeGraph): TypeGraph => {
    const stringTypeMapping = ctx.stringTypeMapping;
    const allPrimitives = Array.from(graph.allTypesUnordered()).filter(t => t.isPrimitive()) as PrimitiveType[];

    const constPrimitives = allPrimitives.filter(t => t.getAttributes().get(constValueTypeAttributeKind));

    function replaceConstWithEnum(
        group: ReadonlySet<PrimitiveType>,
        builder: GraphRewriteBuilder<PrimitiveType>,
        forwardingRef: TypeRef
    ): TypeRef {
        assert(group.size === 1);
        const t = group.values().next().value as PrimitiveType;
        const constValue = t.getAttributes().get(constValueTypeAttributeKind);

        assert(constValue !== undefined);

        return builder.getEnumType(
            emptyTypeAttributes,
            new Set([constValue]) as unknown as ReadonlySet<string>,
            forwardingRef
        );
    }

    return graph.rewrite(
        "replace const values",
        stringTypeMapping,
        false,
        constPrimitives.map(t => [t]),
        ctx.debugPrintReconstitution,
        replaceConstWithEnum
    );
};
