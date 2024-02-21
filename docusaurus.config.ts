import { themes as prismThemes } from "prism-react-renderer";
import type { Config, PluginConfig } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "OHC Docs",
  tagline: "Dinosaurs are cool",
  favicon: "favicon.ico",

  url: "https://docs.ohc.network",
  baseUrl: "/",

  organizationName: "coronasafe",
  projectName: "docs",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/coronasafe/docs/tree/master/",
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/coronasafe/docs/tree/master/",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        language: ["en"],
      },
    ],
  ] satisfies PluginConfig[],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "",
      logo: {
        alt: "OHC",
        srcDark: "img/logo/svg/light_full.svg",
        src: "img/logo/svg/color_full.svg",
      },
      items: [
        { to: "/docs/care", label: "Care", position: "left" },
        { to: "/blog", label: "Blog", position: "left" },
        {
          href: 'https://github.com/coronasafe/docs',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      // style: 'dark',
      logo: {
        alt: "Open Healthcare Network Logo",
        src: "img/logo/svg/color_logo.svg",
        srcDark: "img/logo/svg/light_logo.svg",
        href: "https://ohc.network",
        width: 60,
        height: 50,
      },
      copyright: `Made with Docusaurus and ♡`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
