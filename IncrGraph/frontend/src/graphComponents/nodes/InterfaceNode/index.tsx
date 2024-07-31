import "./InterfaceNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import { IGCEdge } from "@/graphComponents/edges/IGCEdge";

interface InterfaceNodeProps extends IGCCodeNodeProps {}

export class InterfaceNode extends IGCCodeNode implements InterfaceNodeProps {

    constructor(props: InterfaceNodeProps) {
        super({
            ...props,
            backgroundColor: STYLES.interfaceNodeColor,
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
