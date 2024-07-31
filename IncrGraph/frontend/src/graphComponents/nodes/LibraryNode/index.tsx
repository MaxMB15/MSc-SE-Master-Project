import "./LibraryNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import { IGCEdge } from "@/graphComponents/edges/IGCEdge";

interface LibraryNodeProps extends IGCCodeNodeProps {}

export class LibraryNode extends IGCCodeNode implements LibraryNodeProps {

    constructor(props: LibraryNodeProps) {
        super({
            ...props,
            backgroundColor: STYLES.libraryNodeColor,
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
