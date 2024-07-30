import { ComponentType } from "react";
import { STYLES } from "@/styles/constants";

import BaseRelationship from "../BaseRelationship";
import { EdgeProps } from "reactflow";

interface DocumentationRelationshipProps extends EdgeProps {}

const DocumentationRelationship: ComponentType<DocumentationRelationshipProps> = (
	props,
) => {
	return (
		<BaseRelationship
			{...props}
			data={{
				...props.data,
				backgroundColor: STYLES.documentationRelationshipColor,
			}}
		/>
	);
};

export default DocumentationRelationship;
