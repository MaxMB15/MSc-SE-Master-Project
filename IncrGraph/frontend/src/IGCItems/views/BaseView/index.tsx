import { IGCNodeProps } from "@/IGCItems/nodes/BaseNode";
import { IGCRelationshipProps } from "@/IGCItems/relationships/BaseRelationship";
import { RegistryComponent } from "@/types/frontend";

export type ComponentReference = Omit<(IGCNodeProps | IGCRelationshipProps), keyof RegistryComponent>;
interface ViewData {
    forComponents: ComponentReference[]; // Empty means general view
}

export type IGCViewProps = React.FC & ViewData & RegistryComponent;