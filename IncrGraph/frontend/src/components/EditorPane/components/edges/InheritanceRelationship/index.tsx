import { ComponentType } from "react";
import { STYLES } from "@/styles/constants";

import BaseRelationship from "../BaseRelationship";
import { EdgeProps } from "reactflow";

interface InheritanceRelationshipProps extends EdgeProps {}

const InheritanceRelationship: ComponentType<InheritanceRelationshipProps> = (
	props,
) => {
	return (
		<BaseRelationship
			{...props}
			data={{
				...props.data,
				backgroundColor: STYLES.inheritanceRelationshipColor,
			}}
		/>
	);
};

export default InheritanceRelationship;
