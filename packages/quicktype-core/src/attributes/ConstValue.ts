import { TypeAttributeKind } from "./TypeAttributes";

export type SupportedConstValue = string | number | boolean | null;

class ConstValueTypeAttributeKind extends TypeAttributeKind<SupportedConstValue> {
    constructor() {
        super("constValue");
    }

    combine(arr: SupportedConstValue[]): SupportedConstValue {
        return arr[0];
    }
}

export const constValueTypeAttributeKind: TypeAttributeKind<SupportedConstValue> = new ConstValueTypeAttributeKind();
