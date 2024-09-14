import { callGetComponents } from "@/requests";
import { IGCNodeProps } from "../IGCItems/nodes/BaseNode";
import { IGCRelationshipProps } from "../IGCItems/relationships/BaseRelationship";
import { IGCViewProps } from "../IGCItems/views/BaseView";

const CACHE_KEY = "component_cache";

interface CacheEntry {
	filePath: string;
	componentName: string;
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
	filePath: string,
	registerComponent: (
		node: IGCNodeProps | IGCRelationshipProps | IGCViewProps,
	) => void,
) => {
	try {
		const componentModule = await import(`${filePath}`);

		// Check all exports
		Object.keys(componentModule).forEach((exportedKey) => {
			const exportedComponent = componentModule[exportedKey];

			// Detect component type based on properties
			if (exportedComponent?.TYPE === "node") {
				// It is a Node component
				registerComponent(exportedComponent as IGCNodeProps);
			} else if (exportedComponent?.TYPE === "relationship") {
				// It is a Relationship component
				registerComponent(exportedComponent as IGCRelationshipProps);
			} else if (exportedComponent?.TYPE === "view") {
				// It is a View component
				registerComponent(exportedComponent as IGCViewProps);
			} else {
				console.warn(
					`Component in ${filePath} with key ${exportedKey} does not match known types`,
				);
			}
		});
	} catch (error) {
		console.error(`Error importing components from ${filePath}:`, error);
	}
};

// Function to fetch components from backend and register them
export const fetchAndRegisterComponents = async (
	registerComponent: (
		component: IGCNodeProps | IGCRelationshipProps | IGCViewProps,
	) => void,
) => {
	try {
		// Fetch the list of .tsx file paths from the backend
		const response = await callGetComponents();
		const componentFiles: string[] = Object.values(response.validComponents).flat();

		// Loop through each fetched component file path and import/categorize them
        for (let i = 0; i < componentFiles.length; i++) {
			await importAndCategorizeComponents(componentFiles[i], registerComponent);
		}
	} catch (error) {
		console.error("Error fetching components from backend:", error);
	}
};
