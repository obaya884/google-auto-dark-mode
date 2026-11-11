export type Scheme = 'dark' | 'light';
export type Site = 'gmail' | 'sheets';

export interface Override {
  mode: Scheme;
  /** 手動で切り替えた時点の端末の設定 */
  osAtSet: Scheme;
}

export interface State {
  enabled: Record<Site, boolean>;
  override: Override | null;
}

export const DEFAULT_STATE: State = {
  enabled: { gmail: true, sheets: true },
  override: null,
};

export function siteFromUrl(url: string): Site | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.hostname === 'mail.google.com') return 'gmail';
  if (parsed.hostname === 'docs.google.com' && parsed.pathname.startsWith('/spreadsheets/')) return 'sheets';
  return null;
}

/** 手動の切り替えは、切り替えた時点の端末の設定が今と同じあいだだけ有効 */
export function isStale(override: Override | null, os: Scheme): boolean {
  return override !== null && override.osAtSet !== os;
}

export function resolve(enabled: boolean, override: Override | null, os: Scheme): Scheme | 'off' {
  if (!enabled) return 'off';
  if (override && !isStale(override, os)) return override.mode;
  return os;
}

/**
 * <html> に付ける属性の値。端末の設定どおりの表示はスタイルシートに任せるので null を返す。
 * スイッチを切ったサイト（'off'）には常に light を付ける。属性がないと、端末がダークに
 * 変わった直後にスタイルシートが先に反転してしまうため。
 */
export function attributeFor(resolved: Scheme | 'off', os: Scheme): Scheme | null {
  if (resolved === 'off') return 'light';
  return resolved === os ? null : resolved;
}

/** shown は今出している表示。反対に切り替えた結果が端末の設定と同じなら、手動の切り替えを解除する */
export function nextOverride(shown: Scheme, os: Scheme): Override | null {
  const target: Scheme = shown === 'dark' ? 'light' : 'dark';
  return target === os ? null : { mode: target, osAtSet: os };
}

function isScheme(value: unknown): value is Scheme {
  return value === 'dark' || value === 'light';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** chrome.storage.local.get(['enabled', 'override']) の戻り値を、欠けや崩れを初期値で埋めて State にする */
export function normalizeState(raw: unknown): State {
  const source = isRecord(raw) ? raw : {};
  const enabled = isRecord(source.enabled) ? source.enabled : {};
  const override = source.override;
  return {
    enabled: {
      gmail: typeof enabled.gmail === 'boolean' ? enabled.gmail : DEFAULT_STATE.enabled.gmail,
      sheets: typeof enabled.sheets === 'boolean' ? enabled.sheets : DEFAULT_STATE.enabled.sheets,
    },
    override:
      isRecord(override) && isScheme(override.mode) && isScheme(override.osAtSet)
        ? { mode: override.mode, osAtSet: override.osAtSet }
        : null,
  };
}
