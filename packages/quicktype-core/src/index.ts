export {
    type Options,
    getTargetLanguage,
    quicktypeMultiFile,
    quicktypeMultiFileSync,
    quicktype,
    combineRenderResults,
    type RunContext,
} from "./Run";
export {
    inferenceFlags,
    inferenceFlagNames,
    defaultInferenceFlags,
    inferenceFlagsObject,
    type InferenceFlags,
    type InferenceFlagName,
} from "./Inference";
export { CompressedJSON, type Value } from "./input/CompressedJSON";
export {
    type Input,
    InputData,
    JSONInput,
    type JSONSourceData,
    jsonInputForTargetLanguage,
} from "./input/Inputs";
export {
    JSONSchemaInput,
    type JSONSchemaSourceData,
} from "./input/JSONSchemaInput";
export {
    Ref,
    type JSONSchemaType,
    type JSONSchemaAttributes,
} from "./input/JSONSchemaInput";
export type { RenderContext } from "./Renderer";
export {
    Option,
    type OptionDefinition,
    getOptionValues,
    type OptionValues,
} from "./RendererOptions";
export { TargetLanguage, type MultiFileRenderResult } from "./TargetLanguage";

export {
    type MultiWord,
    type Sourcelike,
    type SerializedRenderResult,
    type Annotation,
    modifySource,
    singleWord,
    parenIfNeeded,
} from "./Source";
export { Name, funPrefixNamer, Namer } from "./Naming";
export { IssueAnnotationData } from "./Annotation";
export {
    panic,
    assert,
    defined,
    assertNever,
    parseJSON,
    checkStringMap,
    checkArray,
    inflateBase64,
} from "./support/Support";
export {
    splitIntoWords,
    capitalize,
    combineWords,
    firstUpperWordStyle,
    allUpperWordStyle,
    legalizeCharacters,
    isLetterOrDigit,
} from "./support/Strings";
export { train as trainMarkovChain } from "./MarkovChain";
export { QuickTypeError, messageError, messageAssert } from "./Messages";
export {
    Type,
    PrimitiveType,
    ArrayType,
    ClassType,
    ClassProperty,
    EnumType,
    MapType,
    UnionType,
    ObjectType,
    type TypeKind,
    type TransformedStringTypeKind,
    type PrimitiveStringTypeKind,
} from "./Type";
export { getStream } from "./input/io/get-stream";

export { readableFromFileOrURL, readFromFileOrURL } from "./input/io/NodeIO";

export { FetchingJSONSchemaStore } from "./input/FetchingJSONSchemaStore";
export { JSONSchemaStore, type JSONSchema } from "./input/JSONSchemaStore";
export { sourcesFromPostmanCollection } from "./input/PostmanCollection";
export { TypeBuilder } from "./Type/TypeBuilder";
export type { StringTypeMapping } from "./Type/TypeBuilderUtils";
export { type TypeRef, derefTypeRef } from "./Type/TypeRef";
export {
    TypeAttributeKind,
    type TypeAttributes,
    emptyTypeAttributes,
} from "./attributes/TypeAttributes";
export {
    TypeNames,
    makeNamesTypeAttributes,
    namesTypeAttributeKind,
} from "./attributes/TypeNames";
export { StringTypes } from "./attributes/StringTypes";
export {
    removeNullFromUnion,
    matchType,
    nullableFromUnion,
} from "./Type/TypeUtils";
export { ConvenienceRenderer } from "./ConvenienceRenderer";
export { uriTypeAttributeKind } from "./attributes/URIAttributes";

export * from "./language";
