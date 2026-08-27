// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

const EDIT_URL = 'https://github.com/ohcnetwork/docs/tree/main/';

const CURRENT_LOCALE = process.env.DOCUSAURUS_CURRENT_LOCALE ?? 'en';
const IS_DEFAULT_LOCALE = CURRENT_LOCALE === 'en';

/** @type {Array<{id: string, label: string, path: string, routeBasePath: string, sidebarPath: string, sidebarId: string}>} */
const CARE_DEPLOYMENTS = [
  {
    id: 'hmis',
    label: 'HMIS',
    path: 'deployments/hmis',
    routeBasePath: 'deployments/hmis',
    sidebarPath: './sidebarsHmis.js',
    sidebarId: 'hmisSidebar',
  },
  {
    id: 'palliative',
    label: 'Palliative',
    path: 'deployments/palliative',
    routeBasePath: 'deployments/palliative',
    sidebarPath: './sidebarsPalliative.js',
    sidebarId: 'palliativeSidebar',
  },
];

/**
 * Cross-cutting guide sections that are not tied to a Care release, so they
 * live outside the versioned docs as their own (unversioned) plugin instances.
 * @type {Array<{id: string, label: string, path: string, routeBasePath: string, sidebarPath: string, sidebarId: string}>}
 */
const GUIDE_SECTIONS = [
  {
    id: 'contributing',
    label: 'Contributing',
    path: 'contributing',
    routeBasePath: 'contributing',
    sidebarPath: './sidebarsContributing.js',
    sidebarId: 'contributingSidebar',
  },
  {
    id: 'deployment',
    label: 'Deployment',
    path: 'deployment',
    routeBasePath: 'deployment',
    sidebarPath: './sidebarsDeployment.js',
    sidebarId: 'deploymentSidebar',
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
  url: 'https://docs.ohc.network/',
  baseUrl: '/',

  organizationName: 'ohcnetwork',
  projectName: 'docs',

  customFields: {
    playbookDeployments: CARE_DEPLOYMENTS.map(({id, label, routeBasePath}) => ({
      id,
      label,
      routeBasePath,
    })),
  },

  clientModules: [require.resolve('./src/clientModules/devLocaleWarning.js')],

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ml'],
    localeConfigs: {
      en: {
        label: 'English',
      },
      ml: {
        label: 'മലയാളം',
      },
    },
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

  plugins: [
    ...[...CARE_DEPLOYMENTS, ...GUIDE_SECTIONS].map(
      (instance) =>
        /** @type {import('@docusaurus/types').PluginConfig} */ ([
          '@docusaurus/plugin-content-docs',
          {
            id: instance.id,
            path: instance.path,
            routeBasePath: instance.routeBasePath,
            sidebarPath: instance.sidebarPath,
            editUrl: EDIT_URL,
          },
        ])
    ),
    // Generates /llms.txt (+ per-page .md files) so AI agents can read the
    // Care docs without scraping HTML. See https://llmstxt.org
    // Only for the default (en) locale — the plugin has no per-locale cache.
    IS_DEFAULT_LOCALE &&
      /** @type {import('@docusaurus/types').PluginConfig} */ ([
        '@signalwire/docusaurus-plugin-llms-txt',
        /** @type {import('@signalwire/docusaurus-plugin-llms-txt').PluginOptions} */
        ({
        siteTitle: 'Care',
        siteDescription:
          'Care is an open source Hospital/Health Management Information System by Open Healthcare Network. These docs cover clinical concepts, flows and references, deployment playbooks, self-hosting guides and contribution workflows.',
        depth: 3,
        enableDescriptions: true,
        onRouteError: 'warn',
        content: {
          enableMarkdownFiles: true,
          enableLlmsFullTxt: true,
          relativePaths: false,
          includeDocs: true,
          includePages: true,
          // Only index the latest released version; older versions stay out of
          // llms.txt so agents don't quote outdated behaviour.
          includeVersionedDocs: false,
          excludeRoutes: ['/search/**', '/ml/**', '/**/tags/**'],
        },
        includeOrder: [
          '/concepts/**',
          '/flows/**',
          '/references/**',
          '/deployments/**',
          '/deployment/**',
          '/contributing/**',
          '/blog/**',
        ],
        optionalLinks: [
          {
            title: 'Care (backend) repository',
            url: 'https://github.com/ohcnetwork/care',
            description: 'Django REST backend source code.',
          },
          {
            title: 'Care frontend repository',
            url: 'https://github.com/ohcnetwork/care_fe',
            description: 'React frontend source code.',
          },
          {
            title: 'Documentation repository',
            url: 'https://github.com/ohcnetwork/docs',
            description: 'Source of this documentation site.',
          },
        ],
        }),
      ]),
  ],

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
            type: 'dropdown',
            label: 'Playbooks',
            position: 'left',
            items: CARE_DEPLOYMENTS.map((deployment) => ({
              type: 'docSidebar',
              sidebarId: deployment.sidebarId,
              label: deployment.label,
              docsPluginId: deployment.id,
            })),
          },
          ...GUIDE_SECTIONS.map((section) => ({
            type: 'docSidebar',
            sidebarId: section.sidebarId,
            position: 'left',
            label: section.label,
            docsPluginId: section.id,
          })),
          {
            type: 'localeDropdown',
            position: 'right',
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
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} Open Healthcare Network Foundation. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.oneLight,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
