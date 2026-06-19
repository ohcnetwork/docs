import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import siteConfig from '@generated/docusaurus.config';
import i18n from '@generated/i18n';

function getPathLocale(pathname) {
  const baseUrl = siteConfig.baseUrl.replace(/\/$/, '');

  for (const locale of i18n.locales) {
    if (locale === i18n.defaultLocale) {
      continue;
    }

    const prefix = `${baseUrl}/${locale}`;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return locale;
    }
  }

  return i18n.defaultLocale;
}

if (ExecutionEnvironment.canUseDOM && process.env.NODE_ENV === 'development') {
  const {pathname} = window.location;
  const pathLocale = getPathLocale(pathname);

  if (pathLocale !== i18n.currentLocale) {
    const banner = document.createElement('div');
    banner.setAttribute('role', 'alert');
    banner.style.cssText =
      'position:fixed;inset:0 auto auto 0;z-index:9999;width:100%;padding:0.875rem 1.25rem;background:#7f1d1d;color:#fff;font:600 0.95rem/1.5 system-ui,sans-serif;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,0.2);';
    banner.innerHTML =
      pathLocale === 'ml'
        ? 'Malayalam is not active in this dev server. Run <code style="background:rgba(255,255,255,0.15);padding:0.1rem 0.35rem;border-radius:4px">npm run start:ml</code> or test both locales with <code style="background:rgba(255,255,255,0.15);padding:0.1rem 0.35rem;border-radius:4px">npm run preview</code>.'
        : 'English is not active in this dev server. Run <code style="background:rgba(255,255,255,0.15);padding:0.1rem 0.35rem;border-radius:4px">npm start</code> or test both locales with <code style="background:rgba(255,255,255,0.15);padding:0.1rem 0.35rem;border-radius:4px">npm run preview</code>.';
    document.body.prepend(banner);
    document.documentElement.style.scrollPaddingTop = '3.5rem';
  }
}
