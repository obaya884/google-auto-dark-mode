import { isStale, nextOverride, resolve, Scheme, Site, State } from './state';
import { loadState, onStateChanged, saveEnabled, saveOverride } from './storage';

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const currentOs = (): Scheme => (darkQuery.matches ? 'dark' : 'light');
const message = (key: string): string => chrome.i18n.getMessage(key);

const current = document.getElementById('current') as HTMLParagraphElement;
const toggle = document.getElementById('toggle') as HTMLButtonElement;
const checkboxes: Record<Site, HTMLInputElement> = {
  gmail: document.getElementById('site-gmail') as HTMLInputElement,
  sheets: document.getElementById('site-sheets') as HTMLInputElement,
};

// ポップアップに出す「今の表示」。サイトごとのスイッチには左右されない
let shown: Scheme = currentOs();

function render(state: State): void {
  const os = currentOs();
  shown = resolve(true, state.override, os) as Scheme;
  current.textContent = message(shown === 'dark' ? 'currentDark' : 'currentLight');
  toggle.textContent = message(shown === 'dark' ? 'switchToLight' : 'switchToDark');
  checkboxes.gmail.checked = state.enabled.gmail;
  checkboxes.sheets.checked = state.enabled.sheets;
  if (isStale(state.override, os)) {
    void saveOverride(null);
  }
}

const refresh = (): void => {
  void loadState().then(render);
};

document.getElementById('note')!.textContent = message('overrideNote');
document.getElementById('label-gmail')!.textContent = message('siteGmail');
document.getElementById('label-sheets')!.textContent = message('siteSheets');

toggle.addEventListener('click', () => {
  void saveOverride(nextOverride(shown, currentOs()));
});

(Object.keys(checkboxes) as Site[]).forEach((site) => {
  checkboxes[site].addEventListener('change', () => {
    void saveEnabled(site, checkboxes[site].checked);
  });
});

refresh();
onStateChanged(render);
darkQuery.addEventListener('change', refresh);
