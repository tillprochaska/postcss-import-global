import postcss from 'postcss';
import importGlobal from '../../src/index.js';
import fs from 'fs';
import path from 'path';

export async function processFixture(fixture) {
    const processor = await postcss([ importGlobal() ]);

    let inputPath = path.resolve(__dirname, '../fixtures', fixture, 'input.css');
    let input = fs.readFileSync(inputPath).toString();

    let expectedPath = path.resolve(__dirname, '../fixtures', fixture, 'expected.css')
    let expected = fs.readFileSync(expectedPath).toString();

    let result = await processor.process(input, {
        from: inputPath,
    });

    return { result, input, output: result.css, expected };
}
