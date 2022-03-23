import { assertEquals } from 'testing/asserts.ts';

import { HelloWorld } from 'src/hello_world.ts';

Deno.test('test hello world', () => {
  assertEquals(HelloWorld(), 'Hello World');
});
