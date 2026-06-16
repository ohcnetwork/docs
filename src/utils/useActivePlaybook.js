import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/**
 * Returns the active playbook deployment when the user is on a playbook route.
 * @returns {{ id: string, label: string, routeBasePath: string } | null}
 */
export function useActivePlaybook() {
  const {pathname} = useLocation();
  const {siteConfig} = useDocusaurusContext();
  const deployments = siteConfig.customFields?.playbookDeployments ?? [];

  return (
    deployments.find((deployment) =>
      pathname.includes(`/${deployment.routeBasePath}`),
    ) ?? null
  );
}
