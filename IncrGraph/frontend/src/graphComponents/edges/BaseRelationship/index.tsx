import "./BaseNode.css";
import { STYLES } from "@/styles/constants";
import { IGCEdge, IGCEdgeProps } from "@/graphComponents/edges/IGCEdge";

interface BaseRelationshipProps extends IGCEdgeProps {}

export class BaseRelationship extends IGCEdge implements BaseRelationshipProps {

    constructor(props: BaseRelationshipProps) {
        super({
            ...props,
            backgroundColor: STYLES.defaultEdgeColor,
        });
    }

    public static KEY = "BaseRelationship";
}
