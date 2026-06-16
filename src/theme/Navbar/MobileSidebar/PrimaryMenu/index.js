import React from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import PlaybookNavbarBack from '@site/src/components/PlaybookNavbarBack';
import {useActivePlaybook} from '@site/src/utils/useActivePlaybook';

function useNavbarItems() {
  return useThemeConfig().navbar.items;
}

export default function NavbarMobilePrimaryMenu() {
  const mobileSidebar = useNavbarMobileSidebar();
  const activePlaybook = useActivePlaybook();
  const items = useNavbarItems();

  if (activePlaybook) {
    return (
      <ul className="menu__list">
        <li className="menu__list-item">
          <PlaybookNavbarBack
            deployment={activePlaybook}
            onNavigate={() => mobileSidebar.toggle()}
          />
        </li>
      </ul>
    );
  }

  return (
    <ul className="menu__list">
      {items.map((item, i) => (
        <NavbarItem
          mobile
          {...item}
          onClick={() => mobileSidebar.toggle()}
          key={i}
        />
      ))}
    </ul>
  );
}
