import { DEFAULT_STATE, siteFromUrl, resolve, attributeFor, isStale, nextOverride, normalizeState } from '../src/state';

describe('siteFromUrl', () => {
  test.each([
    ['https://mail.google.com/mail/u/0/#inbox', 'gmail'],
    ['https://docs.google.com/spreadsheets/d/abc/edit', 'sheets'],
    ['https://docs.google.com/spreadsheets/u/0/', 'sheets'],
    ['https://docs.google.com/document/d/abc/edit', null],
    ['https://example.com/spreadsheets/', null],
    ['not a url', null],
  ])('%s -> %s', (url, site) => expect(siteFromUrl(url)).toBe(site));
});

describe('resolve', () => {
  test('スイッチが切れていれば off', () => expect(resolve(false, null, 'dark')).toBe('off'));
  test('手動の切り替えがなければ端末の設定', () => expect(resolve(true, null, 'dark')).toBe('dark'));
  test('有効な手動の切り替えに従う', () =>
    expect(resolve(true, { mode: 'light', osAtSet: 'dark' }, 'dark')).toBe('light'));
  test('端末の設定が変わったら手動の切り替えを無視する', () =>
    expect(resolve(true, { mode: 'light', osAtSet: 'dark' }, 'light')).toBe('light'));
  test('古い手動の切り替え（ダーク指定）も無視する', () =>
    expect(resolve(true, { mode: 'dark', osAtSet: 'light' }, 'dark')).toBe('dark'));
  test('スイッチが切れていれば手動の切り替えより優先して off', () =>
    expect(resolve(false, { mode: 'dark', osAtSet: 'light' }, 'light')).toBe('off'));
});

describe('attributeFor', () => {
  test.each([
    ['dark', 'dark', null],
    ['light', 'light', null],
    ['dark', 'light', 'dark'],
    ['light', 'dark', 'light'],
    ['off', 'dark', 'light'],
    ['off', 'light', 'light'],
  ] as const)('resolved=%s os=%s -> %s', (resolved, os, attr) =>
    expect(attributeFor(resolved, os)).toBe(attr));
});

describe('isStale', () => {
  test('null は古くない', () => expect(isStale(null, 'dark')).toBe(false));
  test('osAtSet が今と同じなら古くない', () =>
    expect(isStale({ mode: 'light', osAtSet: 'dark' }, 'dark')).toBe(false));
  test('osAtSet が今と違えば古い', () =>
    expect(isStale({ mode: 'light', osAtSet: 'dark' }, 'light')).toBe(true));
});

describe('nextOverride', () => {
  test('端末と同じ表示から切り替えると override を作る', () =>
    expect(nextOverride('dark', 'dark')).toEqual({ mode: 'light', osAtSet: 'dark' }));
  test('端末と違う表示から切り替えると null に戻す', () =>
    expect(nextOverride('light', 'dark')).toBeNull());
});

describe('normalizeState', () => {
  test('空なら初期値', () => expect(normalizeState({})).toEqual(DEFAULT_STATE));
  test('undefined なら初期値', () => expect(normalizeState(undefined)).toEqual(DEFAULT_STATE));
  test('片方のサイトだけ保存されていれば、残りは初期値', () =>
    expect(normalizeState({ enabled: { gmail: false } })).toEqual({
      enabled: { gmail: false, sheets: true },
      override: null,
    }));
  test('形の崩れた override は null', () =>
    expect(normalizeState({ override: { mode: 'blue', osAtSet: 'dark' } }).override).toBeNull());
  test('正しい override は残す', () =>
    expect(normalizeState({ override: { mode: 'light', osAtSet: 'dark' } }).override).toEqual({
      mode: 'light',
      osAtSet: 'dark',
    }));
});
