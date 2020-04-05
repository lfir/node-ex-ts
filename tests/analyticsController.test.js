const ctrl = require('../src/analyticsController');

test('normalizeLanguage on an empty string is an empty string', () => {
  const lang = '';
  expect(ctrl.normalizeLanguage(lang)).toMatch(lang);
});

test('normalizeLanguage "en-US,en;q=0.9" returns "en"', () => {
  const lang = 'en-US,en;q=0.9';
  expect(ctrl.normalizeLanguage(lang)).toMatch(lang.substring(0, 2));
});

test('normalizeLanguage "cmn" returns "cmn"', () => {
  const lang = 'cmn';
  expect(ctrl.normalizeLanguage(lang)).toMatch(lang);
});

test('normalizePath removes ".html" extension from string', () => {
    const path = '/test/pg1.html';
    expect(ctrl.normalizePath(path)).toMatch(path.substring(0, 9));
});

test('normalizePath replces path "/index.html" with "/"', () => {
    const path = '/index.html';
    expect(ctrl.normalizePath(path)).toMatch(path.substring(0, 1));
});

test('normalizePath does not modify ".html" occurrences not at the end of the string', () => {
  const path = '/howto/buildindex.htmlfromtemplates';
  expect(ctrl.normalizePath(path)).toMatch(path);
});

test('normalizePath does not modify "/index" occurrences that are not the whole path', () => {
  const path = '/howto/index/templates';
  expect(ctrl.normalizePath(path)).toMatch(path);
});

test('normalizePath on an empty string is an empty string', () => {
  const path = '';
  expect(ctrl.normalizePath(path)).toMatch(path);
});
