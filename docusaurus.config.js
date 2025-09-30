import { themes as prismThemes } from 'prism-react-renderer';

const globalVariables = {
  'mgeversion': '5.1.0'
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MonoGame.Extended',
  tagline: 'Extensions to make MonoGame more awesome',
  favicon: 'img/favicon.ico',
  url: 'https://www.monogameextended.net',
  baseUrl: '/',
  organizationName: 'MonoGame-Extended',
  projectName: 'monogame-extended.github.io',
  deploymentBranch: 'gh-pages',
  trailingSlash: true,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'me',
        href: 'https://mastodon.gamedev.place/@monogameextended'
      }
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'fediverse:creator',
        content: '@monogameextended@mastodon.gamedev.place',
      },
    }
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/monogame-extended/monogame-extended.github.io/tree/develop/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/monogame-extended/monogame-extended.github.io/tree/develop/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  markdown: {
    preprocessor: ({ filePath, fileContent }) => {
      var key = '';
      var found = false;
      for (key in globalVariables) {
        fileContent = fileContent.replaceAll(`@${key}@`, globalVariables[key]);
      }
      return fileContent;
    }
  },

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/monogame-extended-social-card.png',
      navbar: {
        title: 'MonoGame.Extended',
        logo: {
          alt: 'MonoGame.Extended Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Docs',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/monogame-extended/Monogame-Extended',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Learn',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/about/introduction/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/FvZ8Z7EzPJ',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/MonoGameEx'
              },
              {
                label: 'Bluesky',
                href: 'https://bsky.app/profile/monogameextended.bsky.social'
              },
              {
                label: 'Mastodon',
                href: 'https://mastodon.gamedev.place/@monogameextended'
              }
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/monogame-extended/monogame-extended',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} MonoGame Extended.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['csharp']
      },
      announcementBar: {
        id: 'announcement-docs-updating',
        content: '⚠ Documentation is currently being updated for V5. There may be missing or incomplete information while they are updated.'
      }
    }),
};

export default config;
