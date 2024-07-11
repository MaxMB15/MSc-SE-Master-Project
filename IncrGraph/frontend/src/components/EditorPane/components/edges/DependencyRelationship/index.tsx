import { ComponentType } from "react";
import { STYLES } from "@/styles/constants";

import BaseRelation from "../BaseRelationship";
import { EdgeProps } from "reactflow";

interface DependencyRelationshipProps extends EdgeProps {}

const DependencyRelationship: ComponentType<DependencyRelationshipProps> = (
	props,
) => {
	return (
		<BaseRelation
			{...props}
			data={{
				...props.data,
				backgroundColor: STYLES.dependencyRelationshipColor,
			}}
		/>
	);
};

export default DependencyRelationship;
