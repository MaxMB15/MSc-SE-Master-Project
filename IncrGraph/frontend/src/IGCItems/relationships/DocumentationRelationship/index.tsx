import { STYLES } from "@/styles/constants";
import BaseRelationship, { IGCRelationshipProps } from "../BaseRelationship";

const DocumentationRelationship: IGCRelationshipProps = (
	props,
) => {
	return (
		<BaseRelationship
			{...props}
			data={{
				...props.data,
				backgroundColor: DocumentationRelationship.COLOR,
			}}
		/>
	);
};
DocumentationRelationship.NAME = "DocumentationRelationship";
DocumentationRelationship.COLOR = STYLES.documentationRelationshipColor;
DocumentationRelationship.TYPE = "relationship";
DocumentationRelationship.SETABLE = false;

export default DocumentationRelationship;
