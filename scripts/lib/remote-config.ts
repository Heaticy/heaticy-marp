export const COS_ORIGIN = "https://heaticy-1310163554.cos.ap-shanghai.myqcloud.com";
export const COS_PREFIX = "markdown/heaticy-marp";
export const COS_BASE_URL = `${COS_ORIGIN}/${COS_PREFIX}`;

export const DEFAULT_THEME = "tutorial-shtu-red";

export const THEME_URLS = {
  "tutorial-shtu-red": `${COS_BASE_URL}/themes/tutorial-shtu-red.css`,
  "report-amber": `${COS_BASE_URL}/themes/report-amber.css`,
} as const;

export type ThemeName = keyof typeof THEME_URLS;

export const ASSET_URLS = {
  tutorialLogo: `${COS_BASE_URL}/assets/logos/ShanghaiTech_Logo_RGBA.png`,
  tutorialName: `${COS_BASE_URL}/assets/logos/ShanghaiTech_Name_RGBA.png`,
  reportLogo: `${COS_BASE_URL}/assets/logos/ShanghaiTech_Logo_RGBA.png`,
  background: `${COS_BASE_URL}/assets/backgrounds/shanghaitech-master.png`,
};

export function resolveThemeUrl(themeName: string): string {
  return THEME_URLS[themeName as ThemeName] ?? THEME_URLS[DEFAULT_THEME];
}
