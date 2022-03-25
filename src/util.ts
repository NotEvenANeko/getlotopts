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
