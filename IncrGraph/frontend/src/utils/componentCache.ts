import { IGCNodeProps } from "@/IGCItems/nodes/BaseNode";
import { IGCRelationshipProps } from "@/IGCItems/relationships/BaseRelationship";
import { IGCViewProps } from "@/IGCItems/views/BaseView";
import { callGetComponents } from "@/requests";
import useStore from "@/store/store";
import {
	ModuleComponent,
	ModuleComponentStored,
	ModuleComponentValues,
} from "@/types/frontend";
const CACHE_KEY = "component_cache1";

interface CacheEntry {
	name: string;
	modulePath: string;
	enabled: boolean;
}

// Function to load cache from localStorage
export const loadComponentCache = (): CacheEntry[] | null => {
	const cache = localStorage.getItem(CACHE_KEY);
	return cache ? JSON.parse(cache) : null;
};

// Function to update cache in localStorage
export const updateComponentCache = (cache: CacheEntry[]): void => {
	localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

// Function to dynamically import and check all exports
export const importAndCategorizeComponents = async (
	componentFilePath: string,
	moduleFilePath: string,
	registerComponent: (
		component: ModuleComponentValues<any>,
	) => ModuleComponentStored,
): Promise<ModuleComponentStored> => {
	const allModuleComponentStored: ModuleComponentStored = {
		nodes: {},
		relationships: {},
		views: {},
	};
	try {
		const componentModule = await import(`${componentFilePath}`);

		// Check all exports
		Object.keys(componentModule).forEach((exportedKey) => {
			const exportedComponent = componentModule[exportedKey];

			// Detect component type based on properties
			if (
				["node", "relationship", "view"].includes(
					exportedComponent?.TYPE,
				)
			) {
				// See if cache has enable/disable status
				let componentEnabled = true;
				const webCache = loadComponentCache();
				if (webCache !== null) {
					const cacheEntry = webCache.find(
						(entry) => entry.modulePath === moduleFilePath && entry.name === exportedComponent.NAME,
					);
					if (cacheEntry !== undefined) {
						componentEnabled = cacheEntry.enabled;
					}
				}

				// Register the component
				const { nodes, relationships, views } = registerComponent({
					object: exportedComponent,
					modulePath: moduleFilePath,
					enabled: componentEnabled,
				});

				// Update the stored components
				allModuleComponentStored.nodes = {
					...allModuleComponentStored.nodes,
					...nodes,
				};
				allModuleComponentStored.relationships = {
					...allModuleComponentStored.relationships,
					...relationships,
				};
				allModuleComponentStored.views = {
					...allModuleComponentStored.views,
					...views,
				};

				// Update the cache
				const entry: CacheEntry = {
					name: exportedComponent.NAME,
					modulePath: moduleFilePath,
					enabled: componentEnabled,
				};
				if (webCache === null) {
					updateComponentCache([entry]);
				} else {
					updateComponentCache([...webCache, entry]);
				}
			} else {
				console.warn(
					`Component in ${componentFilePath} with key ${exportedKey} does not match known types`,
				);
			}
		});
	} catch (error) {
		console.error(
			`Error importing components from ${componentFilePath}:`,
			error,
		);
	}
	return allModuleComponentStored;
};

// Function to fetch components from backend and register them
export const fetchAndRegisterComponents = async (
	registerComponent: (component: ModuleComponentValues<any>) => ModuleComponentStored,
) => {
	const { setNodeTypes, setRelationshipTypes, setViewTypes, setModuleData } =
		useStore.getState();

	try {
		const allModuleComponentStored: ModuleComponentStored = {
			nodes: {},
			relationships: {},
			views: {},
		};
		// Fetch the list of .tsx file paths from the backend
		const modules = await callGetComponents();

		// Loop through each fetched component file path and import/categorize them
		for (let i = 0; i < modules.length; i++) {
			const componentFiles = modules[i].files;
			for (let j = 0; j < componentFiles.length; j++) {
				// Register all components from the module
				const { nodes, relationships, views } =
					await importAndCategorizeComponents(
						componentFiles[j],
						modules[i].search_path,
						registerComponent,
					);

				// Update the stored components
				allModuleComponentStored.nodes = {
					...allModuleComponentStored.nodes,
					...nodes,
				};
				allModuleComponentStored.relationships = {
					...allModuleComponentStored.relationships,
					...relationships,
				};
				allModuleComponentStored.views = {
					...allModuleComponentStored.views,
					...views,
				};

				// Update the module data
				setModuleData(() => modules);
			}
		}

        // Update the type stores
        setNodeTypes(() => allModuleComponentStored.nodes);
        setRelationshipTypes(() => allModuleComponentStored.relationships);
        setViewTypes(() => allModuleComponentStored.views);

	} catch (error) {
		console.error("Error fetching components from backend:", error);
	}
};
