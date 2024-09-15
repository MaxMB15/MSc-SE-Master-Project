import useStore from "@/store/store";
import { ModuleComponentStored, ModuleComponentValues } from "@/types/frontend";
import {
	loadComponentCache,
	updateComponentCache,
} from "@/utils/componentCache";

export const useComponentRegistry = () => {
	const { setNodeTypes, setRelationshipTypes, setViewTypes } = useStore();

	// Functions to register/unregister Nodes, Relationships, and Views
	const registerComponent = (
		component: ModuleComponentValues<any>,
	): ModuleComponentStored => {
		const allModuleComponentStored: ModuleComponentStored = {
			nodes: {},
			relationships: {},
			views: {},
		};
		if (component.object.TYPE === "node") {
			allModuleComponentStored.nodes = {
				[component.object.NAME]: component,
			};
		} else if (component.object.TYPE === "relationship") {
			allModuleComponentStored.relationships = {
				[component.object.NAME]: component,
			};
		} else if (component.object.TYPE === "view") {
			allModuleComponentStored.views = {
				[component.object.NAME]: component,
			};
		}
		return allModuleComponentStored;
	};

	const updateComponent = (component: ModuleComponentValues<any>) => {
		if (component.object.TYPE === "node") {
			setNodeTypes((prevNodeTypes) => {
				prevNodeTypes[component.object.NAME] = component;
				return prevNodeTypes;
			});
		} else if (component.object.TYPE === "relationship") {
			setRelationshipTypes((prevRelationshipTypes) => {
				prevRelationshipTypes[component.object.NAME] = component;
				return prevRelationshipTypes;
			});
		} else if (component.object.TYPE === "view") {
			setViewTypes((prevViewTypes) => {
				prevViewTypes[component.object.NAME] = component;
				return prevViewTypes;
			});
		}

        // Update the cache
		let webCache = loadComponentCache();
		if (webCache === null) {
			return;
		}
		webCache = webCache.map((entry) => {
			if (
				entry.modulePath === component.modulePath &&
				entry.name === component.object.NAME
			) {
				entry.enabled = component.enabled;
			}
			return entry;
		});
		updateComponentCache(webCache);
	};
	return {
		registerComponent,
		updateComponent,
	};
};
