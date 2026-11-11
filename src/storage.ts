import { normalizeState, Override, Site, State } from './state';

// コンテンツスクリプトとポップアップが別々のキーを書くので、互いの書き込みを上書きしない
const KEYS = ['enabled', 'override'];

export async function loadState(): Promise<State> {
  return normalizeState(await chrome.storage.local.get(KEYS));
}

export async function saveOverride(override: Override | null): Promise<void> {
  await chrome.storage.local.set({ override });
}

export async function saveEnabled(site: Site, value: boolean): Promise<void> {
  const { enabled } = await loadState();
  await chrome.storage.local.set({ enabled: { ...enabled, [site]: value } });
}

/** enabled か override が変わるたびに、読み直した State を渡す */
export function onStateChanged(listener: (state: State) => void): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (!KEYS.some((key) => key in changes)) return;
    loadState().then(listener, () => {
      // 拡張の再読み込みのあとなどは読めない。表示はスタイルシートに任せる
    });
  });
}
