const postcss = require('postcss');
const importGlobal = require('../../cjs/index.js').default;
const fs = require('fs');
const path = require('path');

const processFixture = async fixture => {
    const processor = await postcss([ importGlobal() ]);

    let inputPath = path.resolve(__dirname, '../fixtures', fixture, 'input.css');
    let input = fs.readFileSync(inputPath).toString();

    let expectedPath = path.resolve(__dirname, '../fixtures', fixture, 'expected.css')
    let expected = fs.readFileSync(expectedPath).toString();

    let result = await processor.process(input, {
        from: inputPath,
    });

    return { result, input, output: result.css, expected };
};

module.exports = { processFixture };
