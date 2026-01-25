import Mustache from 'mustache';
import * as path from 'path';
import * as fs from 'fs';

const header = (params: object = {}) => {
    return Mustache.render(fs.readFileSync(path.resolve('./src/emails/layout/Header.html'), 'utf8'), params);
};
const template = (template: string, params: object = {}) => {
    return Mustache.render(fs.readFileSync(path.resolve(`./src/emails/${template}.html`), 'utf8'), ((params) ? params : {}));
};
const footer = (params: object = {}) => {
    return Mustache.render(fs.readFileSync(path.resolve('./src/emails/layout/Footer.html'), 'utf8'), params);
};

const generate = (template: string, params: object = {}) => {
    return Mustache.render(fs.readFileSync(path.resolve('./src/emails/layout/Header.html'), 'utf8'), params).concat(
        Mustache.render(fs.readFileSync(path.resolve(`./src/emails/${template}.html`), 'utf8'), params)
    ).concat(
        Mustache.render(fs.readFileSync(path.resolve('./src/emails/layout/Footer.html'), 'utf8'), params)
    );
};


export default {
    header,
    template,
    footer,
    generate,
};