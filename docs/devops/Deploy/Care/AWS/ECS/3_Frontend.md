# Deploying Care Frontend

## Setting up the Frontend

The development deployment for Care relies on ECS for its backend deployment. The API provided by the backend can be used by all development frontends, including localhost and Care_FE deploy previews.

We can use any of the following methods to deploy the frontend for both production and deployment previews:

- **Cloudflare Pages**: A static site hosting service that supports automatic deployments from GitHub repositories. The guide explains how to deploy preview builds of the frontend using [Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/preview-deployments).

- **Netlify**: Another static site hosting service that supports automatic deployments from GitHub repositories. The guide explains how to deploy preview builds of the frontend using [Netlify](https://docs.netlify.com/site-deploys/deploy-previews).

- **Vercel**: Another static site hosting service that supports automatic deployments from GitHub repositories. The guide explains how to deploy preview builds of the frontend using [Vercel](https://vercel.com/docs/concepts/deployments/previews).
