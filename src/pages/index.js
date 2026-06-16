import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const FeatureList = [
  {
    title: 'FHIR-Native',
    description:
      'Built around FHIR R5, SNOMED CT, LOINC, and open APIs — interoperable by design, not as an afterthought.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6h16M4 12h10M4 18h16" strokeLinecap="round" />
        <circle cx="18" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: 'Clinical Workflows',
    description:
      'OP, IP, emergency, labs, pharmacy, billing, tasks, referrals, and care plans — everything a hospital needs.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 4v16M4 12h16" strokeLinecap="round" />
        <rect x="3" y="3" width="18" height="18" rx="3" />
      </svg>
    ),
  },
  {
    title: 'Open Source',
    description:
      'MIT licensed and listed as a Digital Public Good. Deploy, adapt, and scale without vendor lock-in.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12a4 4 0 108 0 4 4 0 10-8 0" />
      </svg>
    ),
  },
  {
    title: 'Extensible Platform',
    description:
      'CARE Core plus plugins for AI Scribe, imaging, devices, analytics, and national health rails.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Role-Based Access',
    description:
      'Granular permissions, audit trails, and security patterns built for accountable clinical environments.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Configurable Forms',
    description:
      'Dynamic questionnaires and value sets let clinicians shape workflows without rewriting the core.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const QuickLinks = [
  {
    title: 'Documentation model',
    description: 'How concepts, flows, and playbooks fit together.',
    to: '/docs/intro',
  },
  {
    title: 'Patient (concept)',
    description: 'What a patient record is in Care.',
    to: '/docs/concepts/clinical/patient',
  },
  {
    title: 'Create a patient (flow)',
    description: 'Step-by-step registration in the product.',
    to: '/docs/flows/clinical/create-patient',
  },
];

function Feature({title, description, icon}) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>{icon}</div>
      <Heading as="h3" className={styles.featureTitle}>
        {title}
      </Heading>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  );
}

function HomepageHeader() {
  const logoUrl = useBaseUrl('/img/ohc_logo.png');

  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={clsx('container', styles.heroInner)}>
        <img
          src={logoUrl}
          alt="Care by Open Healthcare Network"
          className={styles.heroLogo}
        />
        <div className={styles.heroBadge}>EMR Documentation</div>
        <Heading as="h1" className={styles.heroTitle}>
          The open EMR for modern healthcare
        </Heading>
        <p className={styles.heroSubtitle}>
          CARE is the electronic medical records platform from{' '}
          <a href="https://ohc.network" target="_blank" rel="noopener noreferrer">
            Open Healthcare Network
          </a>
          . FHIR-native, self-hostable, and built for hospitals, clinics, and
          public health programs worldwide.
        </p>
        <div className={styles.heroButtons}>
          <Link className={clsx('button button--lg', styles.primaryButton)} to="/docs/intro">
            Get Started
          </Link>
          <a
            className={clsx('button button--lg', styles.secondaryButton)}
            href="https://ohc.network"
            target="_blank"
            rel="noopener noreferrer">
            Visit ohc.network
          </a>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>FHIR R5</span>
            <span className={styles.statLabel}>Standards-native</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>MIT</span>
            <span className={styles.statLabel}>Open license</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>DPG</span>
            <span className={styles.statLabel}>Verified public good</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Built for the field
          </Heading>
          <p className={styles.sectionSubtitle}>
            CARE Core provides reusable primitives for patient records, encounters,
            orders, observations, and more — so implementers can focus on care, not
            infrastructure.
          </p>
        </div>
        <div className={styles.featureGrid}>
          {FeatureList.map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageQuickLinks() {
  return (
    <section className={styles.quickLinks}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Explore the docs
          </Heading>
          <p className={styles.sectionSubtitle}>
            Everything you need to deploy, configure, and extend CARE.
          </p>
        </div>
        <div className={styles.linkGrid}>
          {QuickLinks.map(({title, description, to}) => (
            <Link key={title} className={styles.linkCard} to={to}>
              <Heading as="h3" className={styles.linkTitle}>
                {title}
              </Heading>
              <p className={styles.linkDescription}>{description}</p>
              <span className={styles.linkArrow} aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageCTA() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <div className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <Heading as="h2" className={styles.ctaTitle}>
              Ready to build on open healthcare infrastructure?
            </Heading>
            <p className={styles.ctaText}>
              Join governments, hospitals, and developers deploying CARE across
              India and beyond. Start with the documentation or connect with the
              OHC Foundation.
            </p>
          </div>
          <div className={styles.ctaButtons}>
            <Link className={clsx('button button--lg', styles.ctaPrimary)} to="/docs/intro">
              Read the docs
            </Link>
            <a
              className={clsx('button button--lg', styles.ctaOutline)}
              href="https://ohc.network"
              target="_blank"
              rel="noopener noreferrer">
              Partner with OHC
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Care Documentation"
      description={`Documentation for Care — the open EMR from ${siteConfig.organizationName || 'Open Healthcare Network'}. FHIR-native, MIT licensed, and built for real-world healthcare delivery.`}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageQuickLinks />
        <HomepageCTA />
      </main>
    </Layout>
  );
}
