import "./BaseNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import IGCRelationship from "@/graphComponents/relationships/IGCRelationship";

interface BaseNodeProps {}

export default class BaseNode extends IGCCodeNode {

    constructor(props: IGCCodeNodeProps<BaseNodeProps>, code: string) {
        super(props, BaseNode.KEY, STYLES.defaultNodeColor, code);
    }

    // Implement abstract methods
    public deserialize(): string {
        // Implementation of deserialize
        return "";
    }

    public metaAnalysis(): void {
        return;
    }

    public createRelationships(edges: IGCRelationship[]): IGCRelationship[] {
        // Implementation of createRelationships
        return edges;
    }

    public static KEY = "BaseNode";
}
