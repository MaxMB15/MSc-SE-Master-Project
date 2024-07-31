import "./DependencyRelationship.css";
import { STYLES } from "@/styles/constants";
import { IGCEdge, IGCEdgeProps } from "@/graphComponents/edges/IGCEdge";

interface DependencyRelationshipProps extends IGCEdgeProps {
    label: string
}

export class DependencyRelationship extends IGCEdge implements DependencyRelationshipProps {

    constructor({label, ...props}: DependencyRelationshipProps) {
        super({
            ...props,
            backgroundColor: STYLES.dependencyRelationshipColor,
            labelObj: {
                label: label,
                labelRadius: 5,
            }
        });
    }

    public static KEY = "DependencyRelationship";
}
