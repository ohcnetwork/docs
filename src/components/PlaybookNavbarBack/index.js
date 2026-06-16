import React from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function PlaybookNavbarBack({deployment, onNavigate}) {
  return (
    <div className={styles.playbookNav}>
      <Link
        className={styles.playbookBack}
        to="/intro"
        onClick={onNavigate}
        aria-label="Back to documentation">
        <span className={styles.playbookBackIcon} aria-hidden="true">
          ←
        </span>
        <Translate id="playbook.nav.back">Documentation</Translate>
      </Link>
      <span className={styles.playbookBadge}>
        <Translate
          id="playbook.nav.badge"
          values={{deployment: deployment.label}}>
          {'{deployment} playbook'}
        </Translate>
      </span>
    </div>
  );
}
