// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

const EDIT_URL = 'https://github.com/ohcnetwork/docs/tree/main/';

/** @type {Array<{id: string, label: string, path: string, routeBasePath: string}>} */
const CARE_DEPLOYMENTS = [
  {
    id: 'hmis',
    label: 'HMIS',
    path: 'deployments/hmis',
    routeBasePath: 'deployments/hmis',
  },
];

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Care',
  tagline: 'The open EMR for modern healthcare',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // GitHub Pages — https://ohcnetwork.github.io/docs/
  url: 'https://ohcnetwork.github.io',
  baseUrl: '/docs/',

  organizationName: 'ohcnetwork',
  projectName: 'docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
          routeBasePath: '',
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: EDIT_URL,
          lastVersion: '3.1',
          includeCurrentVersion: false,
          versions: {
            '3.1': {
              label: '3.1',
            },
            '3.0': {
              label: '3.0',
              banner: 'unmaintained',
            },
          },
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: EDIT_URL,
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: CARE_DEPLOYMENTS.map((deployment) => [
    '@docusaurus/plugin-content-docs',
    {
      id: deployment.id,
      path: deployment.path,
      routeBasePath: deployment.routeBasePath,
      sidebarPath: './sidebarsHmis.js',
      editUrl: EDIT_URL,
    },
  ]),

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/ohc_banner.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Care',
        logo: {
          alt: 'Care Documentation Logo',
          src: 'img/care_gradient.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
            docsPluginId: 'default',
          },
          {
            type: 'docSidebar',
            sidebarId: 'hmisSidebar',
            position: 'left',
            label: 'Playbooks',
            docsPluginId: 'hmis',
          },
          {
            type: 'docsVersionDropdown',
            position: 'right',
            dropdownActiveClassDisabled: true,
            docsPluginId: 'default',
            versions: ['3.1', '3.0'],
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Open Healthcare Network Foundation. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.oneLight,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
