import "./OverridesRelationship.css";
import { STYLES } from "@/styles/constants";
import { IGCEdge, IGCEdgeProps } from "@/graphComponents/edges/IGCEdge";

interface OverridesRelationshipProps extends IGCEdgeProps {}

export class OverridesRelationship extends IGCEdge implements OverridesRelationshipProps {

    constructor({...props}: OverridesRelationship) {
        super({
            ...props,
            backgroundColor: STYLES.overridesRelationshipColor,
        });
    }

    public static KEY = "OverridesRelationship";
}
