---
sidebar_position: 1
title: Data security
---

# Data security

Care holds sensitive patient health data, so a production deployment should be
hardened at every layer — the edge, the network, transport, data at rest, and
the operational paths your team uses to manage it.

This page lists the **standard security practices to enable**, based on how OHC
operates its own production instances. Treat it as a recommended baseline rather
than a finished checklist: the exact mechanism depends on your provider (for
example [Cloudflare](https://www.cloudflare.com/), [AWS WAF & Shield](https://aws.amazon.com/waf/),
[Google Cloud Armor](https://cloud.google.com/armor), or the
[APISIX](https://apisix.apache.org/) ingress used in the
[Kubernetes reference deployment](../kubernetes/architecture.md)), but the
controls themselves apply to any deployment.

:::note
This is a baseline, not an exhaustive standard. Security is ongoing — pair these
controls with periodic penetration testing and security audits, and review them
whenever your infrastructure changes.
:::

## Edge protection and WAF

- **Run a Web Application Firewall** in front of the application, configured with
  the [OWASP Core Rule Set](https://owasp.org/www-project-modsecurity-core-rule-set/)
  to protect against common attack categories such as SQL injection and
  cross-site scripting (XSS).
- **Add custom WAF rules** for application-specific threats and bot mitigation,
  on top of the core rule set.
- **Block by IP reputation / threat score.** Deny traffic from IP addresses with
  a poor reputation (for example, a threat score above a chosen threshold).
- **Apply ASN- and geo-based lockdown** where appropriate for your deployment —
  restrict or block traffic from networks and regions you do not serve, against
  a known threat matrix.
- **Enable rate limiting and sanity checks** so a single client cannot flood the
  application, and obvious malformed or abusive requests are dropped at the edge.
- **Use DDoS protection** from your edge/CDN provider to absorb volumetric
  attacks.

## Network controls

- **Lock down ports.** Allow only ports `80` and `443` from the internet across
  the network; everything else should be reachable only over private networking.
- **Reverse-proxy all traffic** so the origin server IPs are masked and never
  exposed directly to clients.
- **Isolate internal services.** Databases, caches, object storage, and search
  must not be reachable from the public internet — only from the application
  hosts that need them (see [Data at rest and the database](#data-at-rest-and-the-database)).

## Transport and browser security

- **Encrypt everything in transit** with TLS 1.2 or above — origin-to-edge,
  service-to-service, and edge-to-user.
- **Preload HSTS** ([HTTP Strict Transport Security](https://developer.mozilla.org/docs/Web/HTTP/Headers/Strict-Transport-Security))
  domain-wide with a long `max-age` (for example one year) to enforce HTTPS-only
  traffic.
- **Set a strict Content Security Policy (CSP)** header to mitigate clickjacking
  and content-injection attacks, and **monitor CSP and Certificate Transparency
  (CT) violations** to keep your threat matrix current.
- **Enable DNSSEC** on your domain to protect against forged DNS answers and
  domain takeover. DNSSEC-protected zones are cryptographically signed so
  resolvers can verify the records came from the domain owner.
- **Serve over HTTP/2 and HTTP/3** with Brotli compression — primarily a
  performance gain, but it keeps clients on modern, well-maintained protocols.

## Data at rest and the database

- **Encrypt all storage** — server nodes, volumes, and database instances —
  using keys managed by a Key Management Service (KMS).
- **Keep the database private.** Allow database connectivity only over the
  internal private network, and only from the backend hosts that require it.
  Never expose the database to the public internet.
- **Scope credentials tightly.** Each component should authenticate with its own
  least-privilege credentials, rotated regularly.

## Backups

- **Take automated, scheduled backups** (daily snapshots at minimum) of the
  database and any stateful stores.
- **Encrypt backups** with KMS-managed keys and store them inside your cloud
  infrastructure without external access.
- **Test restores.** A backup you have never restored is not a backup — verify
  periodically that a fresh environment can be rebuilt from it. See
  [Day-2 operations](../kubernetes/operations.md) for the Kubernetes reference
  deployment's backup tooling.

## Access and operational security

- **Gate all maintenance access** behind a VPN plus a bastion (jump) host. Cluster
  and server management should never be performed directly over the public
  internet.
- **Enforce least privilege** for human operators and service accounts alike, and
  review access grants regularly.
- **Use strong authentication** (and multi-factor authentication) for every
  administrative entry point.

## Deployment pipeline

- **Deploy through automated CI/CD.** Branch-based continuous integration and
  delivery removes manual, unaudited access to production and gives you a record
  of every change.
- **Roll out without downtime or exposure.** Create new pods before terminating
  the old ones so a deploy never drops traffic, and so partially-updated code is
  never publicly reachable.

## Next steps

Security controls protect the system; **privacy controls protect the people in
it**. Continue to [Privacy and data protection](./privacy-and-data-protection.md)
for how to handle patient data responsibly and meet your regulatory obligations.
