import { ComponentType } from "react";
import { STYLES } from "@/styles/constants";

import BaseRelation from "../BaseRelationship";
import { EdgeProps } from "reactflow";

interface DocumentationRelationshipProps extends EdgeProps {}

const DocumentationRelationship: ComponentType<DocumentationRelationshipProps> = (
	props,
) => {
	return (
		<BaseRelation
			{...props}
			data={{
				...props.data,
				backgroundColor: STYLES.documentationRelationshipColor,
			}}
		/>
	);
};

export default DocumentationRelationship;
