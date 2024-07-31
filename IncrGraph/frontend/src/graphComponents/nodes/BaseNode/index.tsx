import "./BaseNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import { IGCEdge } from "@/graphComponents/edges/IGCEdge";

interface BaseNodeProps extends IGCCodeNodeProps {}

export class BaseNode extends IGCCodeNode implements BaseNodeProps {

    constructor(props: BaseNodeProps) {
        super({
            ...props,
            backgroundColor: STYLES.defaultNodeColor,
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

    public static KEY = "BaseNode";
}
