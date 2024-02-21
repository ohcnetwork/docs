import clsx from "clsx"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import Heading from "@theme/Heading"

import styles from "./index.module.css"

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Welcome to Open Healthcare Network
        </Heading>
        <p className="hero__subtitle">
          Feel free to look around and make changes if required!
        </p>
      </div>
    </header>
  )
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`Home`}
      description="Homepage of Open Healthcare Network docs"
    >
      <HomepageHeader />
      <main></main>
    </Layout>
  )
}
