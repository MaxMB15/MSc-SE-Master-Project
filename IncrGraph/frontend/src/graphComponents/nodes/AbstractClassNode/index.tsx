import "./AbstractClassNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import IGCRelationship from "@/graphComponents/relationships/IGCRelationship";

interface AbstractClassNodeProps {}

export default class AbstractClassNode extends IGCCodeNode {

    constructor(props: IGCCodeNodeProps<AbstractClassNodeProps>, code: string) {
        super(props, AbstractClassNode.KEY, STYLES.abstractClassNodeColor, code);
    }

    // Implement abstract methods
    public deserialize(): string {
        // Implementation of deserialize
        return "";
    }

    public metaAnalysis(): void {
        if (this.getDefinitions().classes.length > 0) {
            this.data.label = this.getDefinitions().classes[0];
        }
    }

    public createRelationships(edges: IGCRelationship[]): IGCRelationship[] {
        // Implementation of createRelationships
        return edges;
    }

    public static KEY = "AbstractClassNode";
}

