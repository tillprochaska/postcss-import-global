import postcss from 'postcss';
import path from 'path';
import fs from 'fs';

class ImportGlobalPlugin {

    constructor({ result, processor, options = {} }) {
        this.result = result;
        this.processor = processor;
        this.options = options;

        if(!options.basePath) {
            this.options.basePath = path.dirname(this.options.from);
        }
    }

    /*
     * Replaces all `@import-global` rules with the contents
     * of the referenced stylesheets and wraps selectors in
     * :global(…) pseudo classes
     */
    async process(tree) {
        let transforms = [];

        tree.walkAtRules('import-global', async importRule => {
            let transform = this.transformImportRule(importRule).catch(error => {
                this.result.warn(error.message, { node: importRule });
                importRule.remove();
            });
            transforms.push(transform);
            transform.then(css => {
                this.result.messages.push({
                    type: 'dependency',
                    file: css.source.input.file,
                    parent: this.options.from,
                });

                if(!css) {
                    importRule.remove();
                    return;
                }

                const comment = postcss.comment({
                    text: path.relative(this.options.basePath, css.source.input.file),
                });

                importRule.before(comment);
                importRule.after(css.nodes);
                importRule.remove();
            });
        });

        return Promise.all(transforms).then(() => {
            return tree;
        });
    }

    /*
     * Replaces an PostCSS `AtRule` rule with the
     * contents of the referenced file, wrapping all
     * selectors in a :global(…) pseudo class
     */
    async transformImportRule(importRule) {
        const filePath = importRule.params.replace(/['"]/g, '');

        let css = await this.parseFile(filePath);
        css = await this.globalizeCss(css);
        css = await this.processCss(css);

        return css;
    }

    /*
     * Takes an PostCSS `Root` element and processes it
     * using the main processor (i. e. runs plugins)
     */
    async processCss(css) {
        let result = css.toResult();
        return this.processor.process(result, {
            from: css.source.input.file,
        }).then(result => {
            return result.root;
        });
    }

    /*
     * Walks through all rules of an PostCSS `Root` element
     * and wraps selectors with :global().
     */
    async globalizeCss(css) {
        let clone = css.clone();

        clone.walkRules(rule => {
            rule.replaceWith(rule.clone({
                selector: `:global(${ rule.selector })`,
            }));
        });

        return clone;
    }

    /*
     * Reads the file’s contents and passes them to
     * the PostCSS parser.
     */
    async parseFile(filePath) {
        filePath = path.resolve(this.options.basePath, filePath);

        if(!fs.existsSync(filePath)) {
            let message = `No such file: ${ path.relative(process.cwd(), filePath) }`;
            throw new Error(message);
        }

        let text = String(fs.readFileSync(filePath));
        return postcss.parse(text, {
            from: filePath,
        });
    }

}

export default postcss.plugin('postcss-import-global', options => {
    return async (tree, result) => {
        options = {
            ...options,
            from: tree.source.input.file
        };

        const plugin = new ImportGlobalPlugin({
            result,
            processor: result.processor,
            options,
        });

        return await plugin.process(tree);
    };
});
