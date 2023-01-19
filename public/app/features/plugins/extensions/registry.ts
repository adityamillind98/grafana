import { error } from 'jquery';

import type { PluginExtensions } from '@grafana/data';

type PluginExtensionsRegistryLink = {
  description: string;
  href: string;
};

type PluginExtensionsRegistry = {
  links: Record<string, PluginExtensionsRegistryLink>;
};

let extensionsRegistry: PluginExtensionsRegistry = {
  links: {},
};

export function getRegistry() {
  return extensionsRegistry;
}

export function configurePluginExtensions(pluginExtensions: Record<string, PluginExtensions>): void {
  const registry = Object.entries(pluginExtensions).reduce<PluginExtensionsRegistry>(
    (registry, [pluginId, pluginExtension]) => {
      const links = pluginExtension.links.reduce<Record<string, PluginExtensionsRegistryLink>>(
        (registryLinks, linkExtension) => {
          registryLinks[`${pluginId}.${linkExtension.id}`] = {
            description: linkExtension.description,
            href: `/a/${pluginId}${linkExtension.path}`,
          };
          return registryLinks;
        },
        {}
      );

      registry.links = { ...links, ...registry.links };
      return registry;
    },
    { links: {} }
  );

  extensionsRegistry = registry;
}

type PluginLinkOptions = {
  id: string;
  queryParams?: Record<string, unknown>;
};

export function getPluginLink({ id, queryParams }: PluginLinkOptions) {
  // belugacdn-app.declare-incident
  const href = '';
  return {
    href, // this will always be a string | undefined
    error, // this will be Error | undefined
  };
}
