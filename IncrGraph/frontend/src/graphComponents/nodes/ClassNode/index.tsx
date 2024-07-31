import "./ClassNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import { IGCEdge } from "@/graphComponents/edges/IGCEdge";

interface ClassNodeProps extends IGCCodeNodeProps {}

export class ClassNode extends IGCCodeNode implements ClassNodeProps {

    constructor(props: ClassNodeProps) {
        super({
            ...props,
            backgroundColor: STYLES.classNodeColor,
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

    public static KEY = "ClassNode";
}
