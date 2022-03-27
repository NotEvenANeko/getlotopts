import { assertEquals, assertThrows } from 'testing/asserts.ts';
import { Option } from 'src/option.ts';

Deno.test('constructor', () => {
  const option = new Option('-a, --all-of-it <type...>', true);
  assertEquals(option.short, '-a');
  assertEquals(option.long, '--all-of-it');
  assertEquals(option.required, true);
  assertEquals(option.valueName, 'allOfIt');
  assertEquals(option.type, 'string-array');
  assertEquals(option.valueNameDisplay, 'type...');
  assertEquals(option.optional, false);
  const booleanOption = new Option('-a, --all');
  assertEquals(booleanOption.type, 'boolean');
});

Deno.test('construtor 2', () => {
  const option = new Option('--all-of-it---name [type]');
  assertEquals(option.short, undefined);
  assertEquals(option.long, '--all-of-it---name');
  assertEquals(option.required, false);
  assertEquals(option.valueName, 'allOfItName');
  assertEquals(option.type, 'string');
  assertEquals(option.valueNameDisplay, 'type');
  assertEquals(option.optional, true);
});

Deno.test('constructor failed', () => {
  assertThrows(() => {
    new Option('-aa');
  });
  assertThrows(() => {
    new Option('-a, ------');
  });
  assertThrows(() => {
    new Option('');
  });
  assertThrows(() => {
    new Option('<type>');
  });
});

Deno.test('getDisplayName', () => {
  const option = new Option('-a |, |, --all <type>');
  assertEquals(option.getDisplayName(), '-a, --all <type>');
});
