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

test('getChosenOptions for empty query string is an empty string', () => {
  const qs = {};
  expect(ctrl.getChosenOptions(qs)).toMatch('');
});

test('getChosenOptions for query string with "limit" parameter returns "limit"', () => {
  const qs = { pageSize: 20, limit: 5, CSRF_TOKEN: 'RPYH' };
  expect(ctrl.getChosenOptions(qs)).toMatch('limit');
});

test('getChosenOptions for query string with "from" & "to" parameters returns "fromTo"', () => {
  const qs = { pageSize: 20, from: '2010-01-01', CSRF_TOKEN: 'RPYH', to: '2010-12-11' };
  expect(ctrl.getChosenOptions(qs)).toMatch('fromTo');
});

test('getChosenOptions for query string with "from", "to" & "limit" parameters returns "fromToAndLimit"', () => {
  const qs = { limit: 5, pageSize: 20, from: '2010-01-01', CSRF_TOKEN: 'RPYH', to: '2010-12-11' };
  expect(ctrl.getChosenOptions(qs)).toMatch('fromToAndLimit');
});

test('validateIdSearchQuery does not throw Error if only id parameter exists', () => {
  const queryParameters = { id: 'qwerty' };
  expect(ctrl.validateIdSearchQuery(queryParameters)).toBeUndefined();
});

test('validateIdSearchQuery throws Error with correct message if no id parameter exists', () => {
  const queryParameters = { tst: 123 };
  expect(() => ctrl.validateIdSearchQuery(queryParameters)).toThrow(Error);
  expect(() => ctrl.validateIdSearchQuery(queryParameters)).toThrow('Invalid search query.');
});

test('validateIdSearchQuery throws Error if extra parameter exists', () => {
  const queryParameters = { tst: 123, id: 'qwerty' };
  expect(() => ctrl.validateIdSearchQuery(queryParameters)).toThrow(Error);
});
