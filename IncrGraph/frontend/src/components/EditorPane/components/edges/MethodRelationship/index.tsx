import { ComponentType } from "react";
import { STYLES } from "@/styles/constants";

import BaseRelation from "../BaseRelationship";
import { EdgeProps } from "reactflow";

interface MethodRelationshipProps extends EdgeProps {}

const MethodRelationship: ComponentType<MethodRelationshipProps> = (
	props,
) => {
	return (
		<BaseRelation
			{...props}
			data={{
				...props.data,
				backgroundColor: STYLES.methodRelationshipColor,
			}}
		/>
	);
};

export default MethodRelationship;
