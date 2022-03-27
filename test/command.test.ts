import { assertEquals, assertThrows } from 'testing/asserts.ts';
import { Command } from '../mod.ts';
import { mockFn } from './utils.ts';

Deno.test('string option', () => {
  const error = mockFn();
  console.error = error.fn;

  const program = new Command();
  program
    .option('-t, --test-camel-case <input>');

  program.parse(['-t', 'thisisinput']);

  assertEquals(program.getOpts(), {
    testCamelCase: 'thisisinput',
  });

  program.parse([]);

  assertEquals(program.getOpts(), {});

  assertThrows(() => {
    program.parse(['-t']);
  });
  assertEquals(
    error.lastCalledWith(),
    `error: option '-t, --test-camel-case <input>' needs a value.`,
  );

  assertThrows(() => {
    program.parse(['-a']);
  });
  assertEquals(
    error.lastCalledWith(),
    `error: option '-a' is not valid option.`,
  );
});

Deno.test('string array option', () => {
  const program = new Command();
  program
    .option('-t <input...>');

  program.parse(['-t', 'input1', 'input2', 'this is input 3']);

  assertEquals(program.getOpts(), {
    t: ['input1', 'input2', 'this is input 3'],
  });

  program.parse(['-t', 'input1', '-t', 'input2', 'this is not input3']);

  assertEquals(program.getOpts(), {
    t: ['input1', 'input2', 'this is not input3'],
  });

  program.parse(['-t', 'input']);

  assertEquals(program.getOpts(), { t: ['input'] });
});

Deno.test('boolean option', () => {
  const program = new Command();
  program
    .option('-b, --boolean');

  program.parse(['-b']);

  assertEquals(program.getOpts(), { boolean: true });

  program.parse(['-b', 'do not resolve this']);

  assertEquals(program.getOpts(), { boolean: true });
});

Deno.test('optional option', () => {
  const program = new Command();
  program
    .option('--optional-option [option]');

  program.parse(['--optional-option']);

  assertEquals(program.getOpts(), {
    optionalOption: true,
  });

  program.parse(['--optional-option', 'this is option']);

  assertEquals(program.getOpts(), {
    optionalOption: 'this is option',
  });
});

Deno.test('required option', () => {
  const error = mockFn();
  console.error = error.fn;

  const program = new Command();
  program
    .requiredOption('-r, --required <param>');

  assertThrows(() => {
    program.parse([]);
  });
  assertEquals(
    error.lastCalledWith(),
    `error: required option '-r, --required <param>' not found.`,
  );

  program.parse(['-r', 'a']);

  assertEquals(program.getOpts(), { required: 'a' });
});

Deno.test('multiple options', () => {
  const program = new Command();
  program
    .option('-a, --all <type>')
    .option('-v, --verbose');

  program.parse([]);

  assertEquals(program.getOpts(), {});

  program.parse(['--verbose', '-a', 'this is type']);

  assertEquals(program.getOpts(), { verbose: true, all: 'this is type' });
});

Deno.test('required argument', () => {
  const error = mockFn();
  console.error = error.fn;

  const program = new Command();
  program
    .argument('<input>');

  assertThrows(() => {
    program.parse([]);
  });
  assertEquals(error.lastCalledWith(), `error: argument 'input' is required.`);

  program.parse(['input']);

  assertEquals(program.getArgs(), { input: 'input' });

  program.parse(['--', '-d input']);

  assertEquals(program.getArgs(), { input: '-d input' });
});

Deno.test('optional argument', () => {
  const program = new Command();
  program
    .argument('[input]');

  program.parse([]);

  assertEquals(program.getArgs(), {});

  program.parse(['input']);

  assertEquals(program.getArgs(), { input: 'input' });
});

Deno.test('array argument', () => {
  const program = new Command();
  program
    .argument('<source>')
    .argument('[files...]');

  program.parse(['file1']);

  assertEquals(program.getArgs(), { source: 'file1' });

  program.parse(['file1', 'file2', 'file3', 'file4']);

  assertEquals(program.getArgs(), {
    source: 'file1',
    files: ['file2', 'file3', 'file4'],
  });
});

Deno.test('multiple argument in one call', () => {
  const program = new Command();
  program
    .argument('<source> [files...]');

  program.parse(['file1']);

  assertEquals(program.getArgs(), { source: 'file1' });

  program.parse(['file1', 'file2', 'file3', 'file4']);

  assertEquals(program.getArgs(), {
    source: 'file1',
    files: ['file2', 'file3', 'file4'],
  });
});

Deno.test('options and arguments', () => {
  const program = new Command();
  program
    .option('-a, --all <type>')
    .option('-b [file]')
    .requiredOption('-v, --verbose')
    .argument('<source> [files...]');

  program.parse([
    '-a',
    'type',
    '-b',
    '123',
    '456',
    '-v',
    '789',
    '--',
    '-b',
    'file1',
  ]);

  assertEquals(program.getArgs(), {
    source: '456',
    files: ['789', '-b', 'file1'],
  });
  assertEquals(program.getOpts(), {
    all: 'type',
    b: '123',
    verbose: true,
  });
});

Deno.test('version', () => {
  const log = mockFn();
  console.log = log.fn;
  console.error = log.fn;

  const program = new Command();
  program
    .version('0.1.0');

  assertThrows(() => {
    program.parse(['-V']);
  });

  assertEquals(log.lastCalledWith(), '0.1.0');

  const programWithCustomOption = new Command();
  programWithCustomOption
    .version('0.2.0', '-v');

  assertThrows(() => {
    programWithCustomOption.parse(['-v']);
  });
  assertEquals(log.lastCalledWith(), '0.2.0');

  assertThrows(() => {
    programWithCustomOption.parse(['-V']);
  });
  assertEquals(log.lastCalledWith(), `error: option '-V' is not valid option.`);
});
