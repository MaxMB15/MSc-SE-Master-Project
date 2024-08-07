import "./LibraryNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import IGCRelationship from "@/graphComponents/relationships/IGCRelationship";

interface LibraryNodeProps {}

export default class LibraryNode extends IGCCodeNode implements LibraryNodeProps {

    constructor(props: IGCCodeNodeProps, code: string) {
        super(props, LibraryNode.KEY, STYLES.libraryNodeColor, code);
    }

    // Implement abstract methods
    public deserialize(): string {
        // Implementation of deserialize
        return "";
    }

    public metaAnalysis(): void {
        if (this.getDependencies().modules.length > 0) {
            this.data.label = this.getDependencies().modules[0];
        }
    }

    public createRelationships(edges: IGCRelationship[]): IGCRelationship[] {
        // Implementation of createRelationships
        return edges;
    }

    public static KEY = "LibraryNode";
}
