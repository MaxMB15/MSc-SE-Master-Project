import "./DocumentationRelationship.css";
import { STYLES } from "@/styles/constants";
import IGCRelationship, { IGCRelationshipProps } from "../IGCRelationship";

class DocumentationRelationship extends IGCRelationship {
	public static KEY = "DocumentationRelationship";
	constructor(props: IGCRelationshipProps) {
		super(props, DocumentationRelationship.KEY, STYLES.documentationRelationshipColor);
	}
}

export default DocumentationRelationship;
