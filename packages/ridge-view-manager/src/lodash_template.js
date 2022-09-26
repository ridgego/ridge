import { template as lodashTemplate } from 'lodash';

const templateMap = new Map();

/**
 * 使用lodash template语法进行字符串计算
 * @param {*} templateStr 模板字符串
 * @param {*} variables 变量对象
 * @returns string 模板运算结果
 */
export default function template(templateStr, variables) {
    if (!templateMap.has(templateStr)) {
        const compiled = lodashTemplate(templateStr, {
            interpolate: /{{([\s\S]+?)}}/g
        });

        templateMap.set(templateStr, compiled);
    }
    return templateMap.get(templateStr)(variables);
}
