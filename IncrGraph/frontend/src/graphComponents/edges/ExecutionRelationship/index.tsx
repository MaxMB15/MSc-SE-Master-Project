import "./ExecutionRelationship.css";
import { STYLES } from "@/styles/constants";
import { IGCEdge, IGCEdgeProps } from "@/graphComponents/edges/IGCEdge";

interface ExecutionRelationshipProps extends IGCEdgeProps {}

export class ExecutionRelationship extends IGCEdge implements ExecutionRelationshipProps {

    constructor({...props}: ExecutionRelationship) {
        super({
            ...props,
            backgroundColor: STYLES.executionRelationshipColor,
        });
    }

    public static KEY = "ExecutionRelationship";
}
