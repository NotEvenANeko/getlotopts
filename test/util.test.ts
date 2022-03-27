import { assertEquals } from 'testing/asserts.ts';
import {
  isNotValue,
  isOptionFlag,
  resolveOptionFlagToParams,
  snakeAndKebabToCamelCase,
} from 'src/util.ts';

Deno.test('snakeAndKebabToCamelCase', () => {
  assertEquals(snakeAndKebabToCamelCase('not_snake'), 'notSnake');
  assertEquals(snakeAndKebabToCamelCase('not_Snake'), 'notSnake');
  assertEquals(snakeAndKebabToCamelCase('not-kebab'), 'notKebab');
  assertEquals(snakeAndKebabToCamelCase('not-Kebab'), 'notKebab');
  assertEquals(snakeAndKebabToCamelCase('not_snake-kebab'), 'notSnakeKebab');
  assertEquals(snakeAndKebabToCamelCase('not_______sssssnake'), 'notSssssnake');
  assertEquals(snakeAndKebabToCamelCase('not-------kkkkkebab'), 'notKkkkkebab');
  assertEquals(snakeAndKebabToCamelCase('not_______Sssssnake'), 'notSssssnake');
  assertEquals(snakeAndKebabToCamelCase('not-------Kkkkkebab'), 'notKkkkkebab');
  assertEquals(snakeAndKebabToCamelCase('___---notStartWith'), 'notStartWith');
  assertEquals(snakeAndKebabToCamelCase('--------'), '');
  assertEquals(snakeAndKebabToCamelCase('isCamelCase'), 'isCamelCase');
});

Deno.test('isNotValue', () => {
  assertEquals(isNotValue('--all'), true);
  assertEquals(isNotValue('-a'), true);
  assertEquals(isNotValue('--'), true);
  assertEquals(isNotValue('a'), false);
});

Deno.test('isOptionFlag', () => {
  assertEquals(isOptionFlag('-a'), true);
  assertEquals(isOptionFlag('--all'), true);
  assertEquals(isOptionFlag('--'), false);
  assertEquals(isOptionFlag('a'), false);
});

Deno.test('resolveOptionFlagToParams', () => {
  assertEquals(resolveOptionFlagToParams('-a, --all <type>'), {
    optionShort: '-a',
    optionLong: '--all',
    optionName: 'all',
    optionOptional: false,
    optionType: 'string',
    optionValueDisplayName: 'type',
    optionReverse: false,
  });
  assertEquals(resolveOptionFlagToParams('-a, --all [type...]'), {
    optionShort: '-a',
    optionLong: '--all',
    optionName: 'all',
    optionOptional: true,
    optionType: 'string-array',
    optionValueDisplayName: 'type...',
    optionReverse: false,
  });
  assertEquals(resolveOptionFlagToParams('-a, --all'), {
    optionShort: '-a',
    optionLong: '--all',
    optionName: 'all',
    optionOptional: false,
    optionType: 'boolean',
    optionValueDisplayName: undefined,
    optionReverse: false,
  });
  assertEquals(resolveOptionFlagToParams('--no-all-of'), {
    optionShort: undefined,
    optionLong: '--no-all-of',
    optionName: 'allOf',
    optionOptional: false,
    optionType: 'boolean',
    optionValueDisplayName: undefined,
    optionReverse: true,
  });
  assertEquals(resolveOptionFlagToParams('-n'), {
    optionShort: '-n',
    optionLong: undefined,
    optionName: 'n',
    optionOptional: false,
    optionType: 'boolean',
    optionValueDisplayName: undefined,
    optionReverse: false,
  });
  assertEquals(resolveOptionFlagToParams(''), undefined);
});
