# Plugins Support - CEP-5

Since care is being used in different environments for different use-cases, there must be some way to configure the application to work
in different environments.

Some type of plugin system is required to achieve this.

Plugins can be abstracted standalone features, they should be capable of being maintained as separate packages, this allows east 3rd party integrations

Plugins should be easily configurable and should use some sort of custom made package manager as well.

## Implementation

Care will add a new package manager called `plugs` , a plug manager would also be added.
plugs will be controlled via a plug config, the plug config would take care of configuring and defining plugs.

The plug config would be a python file that defines all the plugins along with their configuration.
Because the config is in python they can also contain functions that can modify the plugins further if needed. 



References: 
- https://github.com/openedx/edx-django-utils/tree/master/edx_django_utils/plugins
- https://github.com/useblocks/groundwork
- 
