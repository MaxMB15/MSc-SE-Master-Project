import { ComponentType } from "react";
import { STYLES } from "@/styles/constants";

import BaseRelationship from "../BaseRelationship";
import { EdgeProps } from "reactflow";

interface DependencyRelationshipProps extends EdgeProps {}

const DependencyRelationship: ComponentType<DependencyRelationshipProps> = (
	props,
) => {
	return (
		<BaseRelationship
			{...props}
			data={{
				...props.data,
				backgroundColor: STYLES.dependencyRelationshipColor,
			}}
            labelRadius={5}
		/>
	);
};

export default DependencyRelationship;
