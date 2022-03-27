import { OptionFlagRegex, OptionFlagValueRegex } from './constant.ts';
import { OptionValueType } from './interface.ts';

export const snakeAndKebabToCamelCase = (str: string) =>
  str
    .replace(/^[-_]*/, '')
    .replaceAll(/[-_]+([a-z])/g, (_, group1: string) => {
      return group1.toUpperCase();
    })
    .replaceAll(/[-_]/g, '');

export const isOptionFlag = (str?: string) =>
  !str ||
  ((str.startsWith('-') || str.startsWith('--')) && str !== '--');

export const isNotValue = (str?: string) =>
  !str || (isOptionFlag(str) || str === '--');

export const resolveOptionFlagToParams = (flag: string) => {
  const firstMatch = OptionFlagValueRegex.exec(flag);
  if (!firstMatch || !firstMatch.groups) return undefined;
  const secondMatch = OptionFlagRegex.exec(firstMatch.groups.prefix);
  if (!secondMatch || !secondMatch.groups) return undefined;

  const optionValueDisplayName = firstMatch.groups.required ||
    firstMatch.groups.optional;
  const optionType: OptionValueType = optionValueDisplayName
    ? optionValueDisplayName.endsWith('...') ? 'string-array' : 'string'
    : 'boolean';

  return {
    long: secondMatch.groups.long,
    short: secondMatch.groups.short,
    optionName: snakeAndKebabToCamelCase(
      (secondMatch.groups.long && secondMatch.groups.long.slice(2)) ||
        (secondMatch.groups.short && secondMatch.groups.short.slice(1)),
    ),
    optionOptional: !!firstMatch.groups.optional,
    optionType,
    optionValueDisplayName,
  };
};
