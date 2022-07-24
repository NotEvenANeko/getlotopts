import { OptionFlagRegex, OptionFlagValueRegex } from './constant.ts';
import { FlagParams, OptionValueType } from './interface.ts';

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

export const resolveOptionFlagToParams = (
  flag: string,
): FlagParams | undefined => {
  const firstMatch = OptionFlagValueRegex.exec(flag);
  if (!firstMatch || !firstMatch.groups) return undefined;
  const secondMatch = OptionFlagRegex.exec(firstMatch.groups.prefix);
  if (!secondMatch || !secondMatch.groups) return undefined;

  const optionValueDisplayName = firstMatch.groups.required ||
    firstMatch.groups.optional;
  const optionType: OptionValueType = optionValueDisplayName
    ? optionValueDisplayName.endsWith('...') ? 'string-array' : 'string'
    : 'boolean';
  const optionReverse = !!(optionType === 'boolean' &&
    secondMatch.groups?.long?.startsWith('--no-'));
  const optionName = snakeAndKebabToCamelCase(
    optionReverse
      ? secondMatch.groups.long.slice(5)
      : (secondMatch.groups.long && secondMatch.groups.long.slice(2)) ||
        (secondMatch.groups.short && secondMatch.groups.short.slice(1)),
  );

  return {
    optionLong: secondMatch.groups.long,
    optionShort: secondMatch.groups.short,
    optionName,
    optionOptional: !!firstMatch.groups.optional,
    optionType,
    optionValueDisplayName,
    optionReverse,
  };
};

export const concatFlag = (
  short?: string,
  long?: string,
  valueNameDisplay?: string,
  optional?: boolean,
) => {
  return `${short ?? ''}${long && (short ? `, ${long}` : long)}${
    valueNameDisplay
      ? (optional ? ` [${valueNameDisplay}]` : ` <${valueNameDisplay}>`)
      : ''
  }`;
};
