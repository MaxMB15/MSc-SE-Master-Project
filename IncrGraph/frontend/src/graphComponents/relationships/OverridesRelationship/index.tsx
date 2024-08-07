import "./OverridesRelationship.css";
import { STYLES } from "@/styles/constants";
import IGCRelationship, { IGCRelationshipProps } from "../IGCRelationship";

class OverridesRelationship extends IGCRelationship {
	public static KEY = "OverridesRelationship";
	constructor(props: IGCRelationshipProps) {
		super(props, OverridesRelationship.KEY, STYLES.overridesRelationshipColor);
	}
}

export default OverridesRelationship;
