import "./AbstractClassNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import { IGCEdge } from "@/graphComponents/edges/IGCEdge";

interface AbstractClassNodeProps extends IGCCodeNodeProps {}

export class AbstractClassNode extends IGCCodeNode implements AbstractClassNodeProps {

    constructor(props: AbstractClassNodeProps) {
        super({
            ...props,
            backgroundColor: STYLES.abstractClassNodeColor,
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
