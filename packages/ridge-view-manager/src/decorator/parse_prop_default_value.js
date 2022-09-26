const genIsTypeFunction = (typeStr) => {
        return (obj) => Object.prototype.toString.call(obj) === `[object ${typeStr}]`;
    },

    isObject = genIsTypeFunction('Object'),
    isArray = genIsTypeFunction('Array'),
    isString = genIsTypeFunction('String'),
    parseValue = (transFunc) => (value) => {
        if (isString(value)) {
            if (value.startsWith('var(') && value.endsWith(')')) {
                const matchRet = value.match(/^var\(\s*([^,]+)\s*,\s*([\s\S]*)\s*\)$/);

                return transFunc(matchRet);
            }
        } else if (isObject(value)) {
            for (let key of Object.keys(value)) {
                value[key] = parseValue(transFunc)(value[key]);
            }
        } else if (isArray(value)) {
            for (let item of value) {
                item = parseValue(transFunc)(item);
            }
        }

        return value;
    };

/**
 * 解析值，将其中颜色值(var()) 转换为 var中定义的默认值
 * @param {*} value
 * @returns
 */
export const parseValueForTranslateColorValues = (value) => {
    const transFunc = (matchRet) => {
        if (matchRet && matchRet instanceof Array) {
            return matchRet[2];
        }
        return value;
    };

    return parseValue(transFunc)(value);
};
