// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OHC Docs',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  url: 'https://docs.ohc.network',
  baseUrl: '/',

  organizationName: 'coronasafe',
  projectName: 'docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/coronasafe/docs/tree/main',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/coronasafe/docs/tree/main',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      navbar: {
        title: '',
        logo: {
          alt: 'OHC',
          srcDark: 'img/logo/PNG/light_full.png',
          src: 'img/logo/PNG/color_full.png',
        },
        items: [
          { to: '/docs/care', label: 'Care', position: 'left' },

          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/coronasafe/docs',
            label: 'GitHub',
            position: 'right',
          },
          {
            type: 'search',
            position: 'right',
          },
        ],
      },
      footer: {
        logo: {
          alt: 'Meta Open Source Logo',
          src: 'img/logo/PNG/color_logo.png',
          srcDark: 'img/logo/PNG/light_logo.png',
          href: 'https://ohc.network',
          width: 60,
          height: 50,
        },
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
