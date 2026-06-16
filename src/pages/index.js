import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate, {translate} from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const FeatureList = [
  {
    title: translate({
      id: 'homepage.feature.fhir.title',
      message: 'FHIR-Native',
    }),
    description: translate({
      id: 'homepage.feature.fhir.description',
      message:
        'Built around FHIR R5, SNOMED CT, LOINC, and open APIs — interoperable by design, not as an afterthought.',
    }),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6h16M4 12h10M4 18h16" strokeLinecap="round" />
        <circle cx="18" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: translate({
      id: 'homepage.feature.workflows.title',
      message: 'Clinical Workflows',
    }),
    description: translate({
      id: 'homepage.feature.workflows.description',
      message:
        'OP, IP, emergency, labs, pharmacy, billing, tasks, referrals, and care plans — everything a hospital needs.',
    }),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 4v16M4 12h16" strokeLinecap="round" />
        <rect x="3" y="3" width="18" height="18" rx="3" />
      </svg>
    ),
  },
  {
    title: translate({
      id: 'homepage.feature.opensource.title',
      message: 'Open Source',
    }),
    description: translate({
      id: 'homepage.feature.opensource.description',
      message:
        'MIT licensed and listed as a Digital Public Good. Deploy, adapt, and scale without vendor lock-in.',
    }),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12a4 4 0 108 0 4 4 0 10-8 0" />
      </svg>
    ),
  },
  {
    title: translate({
      id: 'homepage.feature.extensible.title',
      message: 'Extensible Platform',
    }),
    description: translate({
      id: 'homepage.feature.extensible.description',
      message:
        'CARE Core plus plugins for AI Scribe, imaging, devices, analytics, and national health rails.',
    }),
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
    title: translate({
      id: 'homepage.feature.rbac.title',
      message: 'Role-Based Access',
    }),
    description: translate({
      id: 'homepage.feature.rbac.description',
      message:
        'Granular permissions, audit trails, and security patterns built for accountable clinical environments.',
    }),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: translate({
      id: 'homepage.feature.forms.title',
      message: 'Configurable Forms',
    }),
    description: translate({
      id: 'homepage.feature.forms.description',
      message:
        'Dynamic questionnaires and value sets let clinicians shape workflows without rewriting the core.',
    }),
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
    title: translate({
      id: 'homepage.quicklinks.model.title',
      message: 'Documentation model',
    }),
    description: translate({
      id: 'homepage.quicklinks.model.description',
      message: 'How concepts, flows, and playbooks fit together.',
    }),
    to: '/intro',
  },
  {
    title: translate({
      id: 'homepage.quicklinks.patient.title',
      message: 'Patient (concept)',
    }),
    description: translate({
      id: 'homepage.quicklinks.patient.description',
      message: 'What a patient record is in Care.',
    }),
    to: '/concepts/clinical/patient',
  },
  {
    title: translate({
      id: 'homepage.quicklinks.create.title',
      message: 'Create a patient (flow)',
    }),
    description: translate({
      id: 'homepage.quicklinks.create.description',
      message: 'Step-by-step registration in the product.',
    }),
    to: '/flows/clinical/create-patient',
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
        <div className={styles.heroBadge}>
          <Translate id="homepage.hero.badge">EMR Documentation</Translate>
        </div>
        <Heading as="h1" className={styles.heroTitle}>
          <Translate id="homepage.hero.title">
            The open EMR for modern healthcare
          </Translate>
        </Heading>
        <p className={styles.heroSubtitle}>
          <Translate
            id="homepage.hero.subtitle"
            values={{
              ohcLink: (
                <a href="https://ohc.network" target="_blank" rel="noopener noreferrer">
                  Open Healthcare Network
                </a>
              ),
            }}>
            {
              'CARE is the electronic medical records platform from {ohcLink}. FHIR-native, self-hostable, and built for hospitals, clinics, and public health programs worldwide.'
            }
          </Translate>
        </p>
        <div className={styles.heroButtons}>
          <Link className={clsx('button button--lg', styles.primaryButton)} to="/intro">
            <Translate id="homepage.hero.cta.primary">Get Started</Translate>
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
            <span className={styles.statLabel}>
              <Translate id="homepage.hero.stat.standards">Standards-native</Translate>
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>MIT</span>
            <span className={styles.statLabel}>
              <Translate id="homepage.hero.stat.license">Open license</Translate>
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>DPG</span>
            <span className={styles.statLabel}>
              <Translate id="homepage.hero.stat.dpg">Verified public good</Translate>
            </span>
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
            <Translate id="homepage.features.title">Built for the field</Translate>
          </Heading>
          <p className={styles.sectionSubtitle}>
            <Translate id="homepage.features.subtitle">
              CARE Core provides reusable primitives for patient records, encounters,
              orders, observations, and more — so implementers can focus on care, not
              infrastructure.
            </Translate>
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
            <Translate id="homepage.quicklinks.title">Explore the docs</Translate>
          </Heading>
          <p className={styles.sectionSubtitle}>
            <Translate id="homepage.quicklinks.subtitle">
              Everything you need to deploy, configure, and extend CARE.
            </Translate>
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
              <Translate id="homepage.cta.title">
                Ready to build on open healthcare infrastructure?
              </Translate>
            </Heading>
            <p className={styles.ctaText}>
              <Translate id="homepage.cta.text">
                Join governments, hospitals, and developers deploying CARE across
                India and beyond. Start with the documentation or connect with the
                OHC Foundation.
              </Translate>
            </p>
          </div>
          <div className={styles.ctaButtons}>
            <Link className={clsx('button button--lg', styles.ctaPrimary)} to="/intro">
              <Translate id="homepage.cta.docs">Read the docs</Translate>
            </Link>
            <a
              className={clsx('button button--lg', styles.ctaOutline)}
              href="https://ohc.network"
              target="_blank"
              rel="noopener noreferrer">
              <Translate id="homepage.cta.partner">Partner with OHC</Translate>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title={translate({id: 'homepage.meta.title', message: 'Care Documentation'})}
      description={translate({
        id: 'homepage.meta.description',
        message:
          'Documentation for Care — the open EMR from Open Healthcare Network. FHIR-native, MIT licensed, and built for real-world healthcare delivery.',
      })}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageQuickLinks />
        <HomepageCTA />
      </main>
    </Layout>
  );
}
