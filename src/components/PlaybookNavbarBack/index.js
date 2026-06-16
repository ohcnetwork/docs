import React from 'react';
import Link from '@docusaurus/Link';
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
        Documentation
      </Link>
      <span className={styles.playbookBadge}>{deployment.label} playbook</span>
    </div>
  );
}
