// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Clinical',
          items: ['concepts/clinical/patient'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Flows',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Clinical',
          items: ['flows/clinical/create-patient'],
        },
      ],
    },
    {
      type: 'category',
      label: 'References',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Clinical',
          items: ['references/clinical/patient'],
        },
      ],
    },
  ],
};

export default sidebars;
