const test = require('node:test');
const assert = require('node:assert');
const { readFileSync } = require('node:fs');

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

test('package name', () => {
  assert.strictEqual(pkg.name, 'shopify-ec-manager');
});
