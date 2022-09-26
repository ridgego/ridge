/* eslint-disable no-undef */
const createPathRewriter = require('../src/path_rewriter');

const config = {
        '^/api/old': '/api/new',
        '^/remove': '',
        invalid: 'path/new',
        '/valid': '/path/new',
        '/some/specific/path': '/awe/some/specific/path',
        '/some': '/awe/some'
    },
    rewriter = createPathRewriter(config);

test('Rewrite rules configuration and usage', async() => {
    expect(rewriter('/api/old/index.json')).toBe('/api/new/index.json');
});

test('Rewrite rules configuration and usage', async() => {
    expect(rewriter('/remove/old/index.json')).toBe('/old/index.json');
});

test('Rewrite rules configuration and usage', async() => {
    expect(rewriter('/invalid/bar/foo.json')).toBe('/path/new/bar/foo.json');

    expect(rewriter('/valid/foo/bar.json')).toBe('/path/new/foo/bar.json');
});

test('Rewrite rules configuration and usage', async() => {
    expect(rewriter('/some/specific/path/bar.json')).toBe('/awe/some/specific/path/bar.json');
    expect(rewriter('/some/hello.json')).toBe('/awe/some/hello.json');
});
