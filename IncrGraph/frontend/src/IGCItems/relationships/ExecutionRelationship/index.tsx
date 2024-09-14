import { ComponentType } from "react";
import { STYLES } from "@/styles/constants";

import BaseRelationship from "../BaseRelationship";
import { EdgeProps } from "reactflow";

interface ExecutionRelationshipProps extends EdgeProps {}

const ExecutionRelationship: ComponentType<ExecutionRelationshipProps> = (
	props,
) => {
	return (
		<BaseRelationship
			{...props}
			data={{
				...props.data,
				backgroundColor: STYLES.executionRelationshipColor,
			}}
            labelRadius={50}
		/>
	);
};

export default ExecutionRelationship;
