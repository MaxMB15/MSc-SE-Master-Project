import { ComponentType } from "react";
import { STYLES } from "@/styles/constants";

import BaseRelation from "../BaseRelationship";
import { EdgeProps } from "reactflow";

interface ExecutionRelationshipProps extends EdgeProps {}

const ExecutionRelationship: ComponentType<ExecutionRelationshipProps> = (
	props,
) => {
	return (
		<BaseRelation
			{...props}
			data={{
				...props.data,
				backgroundColor: STYLES.executionRelationshipColor,
			}}
		/>
	);
};

export default ExecutionRelationship;
