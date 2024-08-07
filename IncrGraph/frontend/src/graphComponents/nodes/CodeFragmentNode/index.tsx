import "./CodeFragmentNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import IGCRelationship from "@/graphComponents/relationships/IGCRelationship";

interface CodeFragmentNodeProps {}

export default class CodeFragmentNode extends IGCCodeNode {

    constructor(props: IGCCodeNodeProps<CodeFragmentNodeProps>, code: string) {
        super(props, CodeFragmentNode.KEY, STYLES.codeFragmentNodeColor, code);
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

    public static KEY = "CodeFragmentNode";
}
