import AnalyticsController from '../src/controller/analyticsController';
import { ESearchOptions } from '../src/controller/searchOptions.enum';

test('normalizeLanguage on an empty string is an empty string', () => {
  const lang = '';
  expect(AnalyticsController.normalizeLanguage(lang)).toBe(lang);
});

test('normalizeLanguage "en-US,en;q=0.9" returns "en"', () => {
  const lang = 'en-US,en;q=0.9';
  expect(AnalyticsController.normalizeLanguage(lang)).toBe(lang.substring(0, 2));
});

test('normalizeLanguage "cmn" returns "cmn"', () => {
  const lang = 'cmn';
  expect(AnalyticsController.normalizeLanguage(lang)).toBe(lang);
});

test('normalizePath removes ".html" extension from string', () => {
    const path = '/test/pg1.html';
    expect(AnalyticsController.normalizePath(path)).toBe(path.substring(0, 9));
});

test('normalizePath replces path "/index.html" with "/"', () => {
    const path = '/index.html';
    expect(AnalyticsController.normalizePath(path)).toBe(path.substring(0, 1));
});

test('normalizePath does not modify ".html" occurrences not at the end of the string', () => {
  const path = '/howto/buildindex.htmlfromtemplates';
  expect(AnalyticsController.normalizePath(path)).toBe(path);
});

test('normalizePath does not modify "/index" occurrences that are not the whole path', () => {
  const path = '/howto/index/templates';
  expect(AnalyticsController.normalizePath(path)).toBe(path);
});

test('normalizePath on an empty string is an empty string', () => {
  const path = '';
  expect(AnalyticsController.normalizePath(path)).toBe(path);
});

test('normalizePath removes trailing "/"', () => {
  const path0 = '/howto/';
  const path1 = '/how/to/';
  const path2 = '/how/to/write';
  expect(AnalyticsController.normalizePath(path0)).toBe(path0.substring(0, path0.length - 1));
  expect(AnalyticsController.normalizePath(path1)).toBe(path1.substring(0, path1.length - 1));
  expect(AnalyticsController.normalizePath(path2)).toBe(path2);
});

test('getChosenOptions for empty query string is NoOptions', () => {
  const qs = {};
  expect(AnalyticsController.getChosenOptions(qs)).toBe(ESearchOptions.NoOptions);
});

test('getChosenOptions for query string with "limit" parameter returns "Limit"', () => {
  const qs = { limit: 5 };
  expect(AnalyticsController.getChosenOptions(qs as any)).toBe(ESearchOptions.Limit);
});

test('getChosenOptions for query string with "from" & "to" parameters returns "FromTo"', () => {
  const qs = { from: '2010-01-01', to: '2010-12-11' };
  expect(AnalyticsController.getChosenOptions(qs)).toBe(ESearchOptions.FromTo);
});

test('getChosenOptions for query string with "from", "to" & "limit" parameters returns "FromToAndLimit"', () => {
  const qs = { limit: 5, from: '2010-01-01', to: '2010-12-11' };
  expect(AnalyticsController.getChosenOptions(qs as any)).toBe(ESearchOptions.FromToAndLimit);
});

test('validateIdSearchQuery does not throw Error if only id parameter exists', () => {
  const queryParameters = { id: 'qwerty' };
  expect(AnalyticsController.validateIdSearchQuery(queryParameters)).toBeUndefined();
});

test('validateIdSearchQuery throws Error with correct message if no id parameter exists', () => {
  const queryParameters = { tst: 123 };
  expect(() => AnalyticsController.validateIdSearchQuery(queryParameters as any)).toThrow(Error);
  expect(() => AnalyticsController.validateIdSearchQuery(queryParameters as any)).toThrow('Invalid search query.');
});

test('validateIdSearchQuery throws Error if extra parameter exists', () => {
  const queryParameters = { tst: 123, id: 'qwerty' };
  expect(() => AnalyticsController.validateIdSearchQuery(queryParameters)).toThrow(Error);
});
