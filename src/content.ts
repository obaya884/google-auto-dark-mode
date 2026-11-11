import { attributeFor, isStale, resolve, Scheme, siteFromUrl, State } from './state';
import { loadState, onStateChanged, saveOverride } from './storage';

const ATTRIBUTE = 'data-auto-dark';

const site = siteFromUrl(location.href);

if (site) {
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const currentOs = (): Scheme => (darkQuery.matches ? 'dark' : 'light');

  const apply = (state: State): void => {
    const os = currentOs();
    const attribute = attributeFor(resolve(state.enabled[site], state.override, os), os);
    const root = document.documentElement;
    if (attribute === null) {
      root.removeAttribute(ATTRIBUTE);
    } else {
      root.setAttribute(ATTRIBUTE, attribute);
    }
    if (isStale(state.override, os)) {
      saveOverride(null).catch(ignore);
    }
  };

  const ignore = (): void => {};
  // 拡張の再読み込みのあとなどは chrome.storage が例外を出す。
  // 古い属性が残らないように外し、表示はスタイルシート（端末の設定）に任せる
  const fallBackToStylesheet = (): void => {
    document.documentElement.removeAttribute(ATTRIBUTE);
  };
  const refresh = (): void => {
    try {
      loadState().then(apply, fallBackToStylesheet);
    } catch {
      fallBackToStylesheet();
    }
  };

  refresh();
  darkQuery.addEventListener('change', refresh);
  try {
    onStateChanged(apply);
  } catch {
    ignore();
  }
}
