const expect = require('chai').expect;
const { processFixture } = require('../support/helpers.js');

it('inlines imported files in-place', async () => {
    let { output, expected } = await processFixture('simple');
    expect(output).equals(expected);
});

it('recursively resolves imports', async () => {
    let { output, expected } = await processFixture('recursive');
    expect(output).equals(expected);
});

it('ignores incorrect filepath', async () => {
    let { result, output, expected } = await processFixture('incorrect-path');
    let messages = result.messages;

    expect(output).equals(expected);
    expect(messages).to.have.lengthOf(1);
    expect(messages[0].type).equals('warning');
    expect(messages[0].text).to.contain('No such file: ');
});

it('resolves relative filepaths', async () => {
    let { output, expected } = await processFixture('relative-path');
    expect(output).equals(expected);
});
