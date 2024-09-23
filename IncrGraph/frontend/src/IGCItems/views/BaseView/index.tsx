import { RegistryComponent } from "@/types/frontend";

interface ViewData {
    forComponents: RegistryComponent[]; // Empty means general view
}

export type IGCViewProps<T={}> = React.FC<T> & ViewData;

export type RegisteredView = IGCViewProps & RegistryComponent;