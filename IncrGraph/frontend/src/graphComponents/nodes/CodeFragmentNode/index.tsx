import "./CodeFragmentNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import { IGCEdge } from "@/graphComponents/edges/IGCEdge";

interface CodeFragmentNodeProps extends IGCCodeNodeProps {}

export class CodeFragmentNode extends IGCCodeNode implements CodeFragmentNodeProps {

    constructor(props: CodeFragmentNodeProps) {
        super({
            ...props,
            backgroundColor: STYLES.codeFragmentNodeColor,
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

    public static KEY = "CodeFragmentNode";

}
