import "./BaseRelationship.css";
import { STYLES } from "@/styles/constants";
import IGCRelationship, { IGCRelationshipProps } from "../IGCRelationship";

class BaseRelationship extends IGCRelationship {
	public static KEY = "BaseRelationship";
	constructor(props: IGCRelationshipProps) {
		super({ ...props },  BaseRelationship.KEY, STYLES.baseRelationshipColor);
	}
}

export default BaseRelationship;
