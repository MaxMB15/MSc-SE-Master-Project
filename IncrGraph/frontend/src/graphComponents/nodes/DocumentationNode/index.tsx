import "./DocumentationNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import { IGCEdge } from "@/graphComponents/edges/IGCEdge";

interface DocumentationNodeProps extends IGCCodeNodeProps {}

export class DocumentationNode extends IGCCodeNode implements DocumentationNodeProps {

    constructor(props: DocumentationNodeProps) {
        super({
            ...props,
            backgroundColor: STYLES.documentationNodeColor,
        });
    }

    // Implement abstract methods
    public deserialize(): string {
        // Implementation of deserialize
        return "";
    }

    public createRelationships(edges: IGCEdge[]): IGCEdge[] {
        // Implementation of createRelationships
        return edges;
    }
}
