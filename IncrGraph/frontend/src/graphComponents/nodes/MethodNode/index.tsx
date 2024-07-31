import "./MethodNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import { IGCEdge } from "@/graphComponents/edges/IGCEdge";

interface MethodNodeProps extends IGCCodeNodeProps {
    scope?: string;
}

export class MethodNode extends IGCCodeNode implements MethodNodeProps {
    scope?: string;
    constructor({scope, ...props}: MethodNodeProps) {
        super({
            ...props,
            backgroundColor: STYLES.methodNodeColor,
        });

        this.scope = scope;

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

    public static KEY = "MethodNode";

}
