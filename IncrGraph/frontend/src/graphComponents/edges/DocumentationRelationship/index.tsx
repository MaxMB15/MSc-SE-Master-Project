import "./DocumentationRelationship.css";
import { STYLES } from "@/styles/constants";
import { IGCEdge, IGCEdgeProps } from "@/graphComponents/edges/IGCEdge";

interface DocumentationRelationshipProps extends IGCEdgeProps {}

export class DocumentationRelationship extends IGCEdge implements DocumentationRelationshipProps {

    constructor({...props}: DocumentationRelationship) {
        super({
            ...props,
            backgroundColor: STYLES.documentationNodeColor,
        });
    }

    public static KEY = "DocumentationRelationship";
}
