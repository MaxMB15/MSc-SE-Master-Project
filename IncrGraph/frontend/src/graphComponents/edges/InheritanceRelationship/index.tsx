import "./InheritanceRelationship.css";
import { STYLES } from "@/styles/constants";
import { IGCEdge, IGCEdgeProps } from "@/graphComponents/edges/IGCEdge";

interface InheritanceRelationshipProps extends IGCEdgeProps {}

export class InheritanceRelationship extends IGCEdge implements InheritanceRelationshipProps {

    constructor({...props}: InheritanceRelationship) {
        super({
            ...props,
            backgroundColor: STYLES.inheritanceRelationshipColor,
        });
    }

    public static KEY = "InheritanceRelationship";
}
