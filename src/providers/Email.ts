import Mustache from 'mustache';
import * as path from 'path';
import * as fs from 'fs';

export default {
    header: (params: object = {}) => {
        return Mustache.render(fs.readFileSync(path.resolve('./src/emails/layout/Header.html'), 'utf8'), params);
    },
    template: (template: string, params: object = {}) => {
        return Mustache.render(fs.readFileSync(path.resolve(`./src/emails/${template}.html`), 'utf8'), ((params) ? params : {}));
    },
    footer: (params: object = {}) => {
        return Mustache.render(fs.readFileSync(path.resolve('./src/emails/layout/Footer.html'), 'utf8'), params);
    },

    generate: (template: string, params: object = {}) => {
        return Mustache.render(fs.readFileSync(path.resolve('./src/emails/layout/Header.html'), 'utf8'), params).concat(
            Mustache.render(fs.readFileSync(path.resolve(`./src/emails/${template}.html`), 'utf8'), params)
        ).concat(
            Mustache.render(fs.readFileSync(path.resolve('./src/emails/layout/Footer.html'), 'utf8'), params)
        );
    }
};