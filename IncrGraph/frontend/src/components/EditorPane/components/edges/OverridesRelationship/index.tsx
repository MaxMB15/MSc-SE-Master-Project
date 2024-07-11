import { ComponentType } from "react";
import { STYLES } from "@/styles/constants";

import BaseRelation from "../BaseRelationship";
import { EdgeProps } from "reactflow";

interface OverridesRelationshipProps extends EdgeProps {}

const OverridesRelationship: ComponentType<OverridesRelationshipProps> = (
	props,
) => {
	return (
		<BaseRelation
			{...props}
			data={{
				...props.data,
				backgroundColor: STYLES.overridesRelationshipColor,
			}}
		/>
	);
};

export default OverridesRelationship;
