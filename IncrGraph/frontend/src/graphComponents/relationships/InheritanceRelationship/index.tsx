import "./InheritanceRelationship.css";
import { STYLES } from "@/styles/constants";
import IGCRelationship, { IGCRelationshipProps } from "../IGCRelationship";

class InheritanceRelationship extends IGCRelationship {
	public static KEY = "InheritanceRelationship";
	constructor(props: IGCRelationshipProps) {
		super(props, InheritanceRelationship.KEY, STYLES.inheritanceRelationshipColor);
	}
}

export default InheritanceRelationship;
