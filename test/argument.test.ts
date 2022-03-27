import { assertEquals, assertThrows } from 'testing/asserts.ts';
import { Argument } from 'src/argument.ts';

Deno.test('constructor', () => {
  const argument = new Argument('[optional]');
  assertEquals(argument.required, false);
  assertEquals(argument.type, 'string');
  assertEquals(argument.valueName, 'optional');
  assertEquals(argument.valueNameDisplay, 'optional');
});

Deno.test('constructor failed', () => {
  assertThrows(() => {
    new Argument('');
  });
  assertThrows(() => {
    new Argument('<type> [optional]');
  });
});
