import { processFixture } from '../support/helpers.js';

it('inlines imported files in-place', async () => {
    let { output, expected } = await processFixture('simple');
    expect(output).toEqual(expected);
});

it('recursively resolves imports', async () => {
    let { output, expected } = await processFixture('recursive');
    expect(output).toEqual(expected);
});

it('ignores incorrect filepath', async () => {
    let { result, output, expected } = await processFixture('incorrect-path');
    let messages = result.messages;

    expect(output).toEqual(expected);
    expect(messages.length).toBe(1);
    expect(messages[0].type).toBe('warning');
    expect(messages[0].text).toContain('No such file: ');
});

it('resolves relative filepaths', async () => {
    let { output, expected } = await processFixture('relative-path');
    expect(output).toEqual(expected);
});
