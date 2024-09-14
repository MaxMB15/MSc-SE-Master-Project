import { IGCNodeProps } from "@/IGCItems/nodes/BaseNode";
import { IGCRelationshipProps } from "@/IGCItems/relationships/BaseRelationship";
import { IGCViewProps } from "@/IGCItems/views/BaseView";
import useStore from "@/store/store";
import { RegistryComponent } from "@/types/frontend";

export const useComponentRegistry = () => {
	const {
		setNodeTypes,
		setRelationshipTypes,
		setViewTypes,
	} = useStore();

	// Functions to register/unregister Nodes, Relationships, and Views
	const registerComponent = (
		component: IGCNodeProps | IGCRelationshipProps | IGCViewProps,
	) => {
		if (component.TYPE === "node") {
			setNodeTypes((prevNodeTypes) => ({
				...prevNodeTypes,
				[component.NAME]: component,
			}));
		} else if (component.TYPE === "relationship") {
			setRelationshipTypes((prevRelationshipTypes) => ({
				...prevRelationshipTypes,
				[component.NAME]: component,
			}));
		} else if (component.TYPE === "view") {
			setViewTypes((prevViewTypes) => ({
				...prevViewTypes,
				[component.NAME]: component,
			}));
		}
	};

	const unregisterComponent = (
		type: "node" | "relationship" | "view",
		componentName: string,
	) => {
		if (type === "node") {
			setNodeTypes((prevNodeTypes) => {
				prevNodeTypes.delete(componentName);
				return prevNodeTypes;
			});
		} else if (type === "relationship") {
			setRelationshipTypes((prevRelationshipTypes) => {
				prevRelationshipTypes.delete(componentName);
				return prevRelationshipTypes;
			});
		} else if (type === "view") {
			setViewTypes((prevViewTypes) => {
				prevViewTypes.delete(componentName);
				return prevViewTypes;
			});
		}
	};

	return {
		registerComponent,
		unregisterComponent,
	};
};
