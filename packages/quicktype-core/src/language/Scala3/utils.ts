import { funPrefixNamer } from "../../Naming";
import {
    allLowerWordStyle,
    allUpperWordStyle,
    combineWords,
    firstUpperWordStyle,
    isDigit,
    isLetterOrUnderscore,
    isNumeric,
    legalizeCharacters,
    splitIntoWords
} from "../../support/Strings";

import { invalidSymbols, keywords } from "./constants";

/**
 * Check if given parameter name should be wrapped in a backtick
 * @param paramName
 */
export const shouldAddBacktick = (paramName: string): boolean => {
    return (
        keywords.some(s => paramName === s) ||
        invalidSymbols.some(s => paramName.includes(s)) ||
        !isNaN(+parseFloat(paramName)) ||
        !isNaN(parseInt(paramName))
    );
};

export const wrapOption = (s: string, optional: boolean): string => {
    if (optional) {
        return "Option[" + s + "]";
    } else {
        return s;
    }
};

function isPartCharacter(codePoint: number): boolean {
    return isLetterOrUnderscore(codePoint) || isNumeric(codePoint);
}

function isStartCharacter(codePoint: number): boolean {
    return isPartCharacter(codePoint) && !isDigit(codePoint);
}

const legalizeName = legalizeCharacters(isPartCharacter);

export function scalaNameStyle(isUpper: boolean, original: string): string {
    const words = splitIntoWords(original);
    return combineWords(
        words,
        legalizeName,
        isUpper ? firstUpperWordStyle : allLowerWordStyle,
        firstUpperWordStyle,
        isUpper ? allUpperWordStyle : allLowerWordStyle,
        allUpperWordStyle,
        "",
        isStartCharacter
    );
}

export const upperNamingFunction = funPrefixNamer("upper", s => scalaNameStyle(true, s));
export const lowerNamingFunction = funPrefixNamer("lower", s => scalaNameStyle(false, s));
