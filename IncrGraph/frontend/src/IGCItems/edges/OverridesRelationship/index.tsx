import { ComponentType } from "react";
import { STYLES } from "@/styles/constants";

import BaseRelationship from "../BaseRelationship";
import { EdgeProps } from "reactflow";

interface OverridesRelationshipProps extends EdgeProps {}

const OverridesRelationship: ComponentType<OverridesRelationshipProps> = (
	props,
) => {
	return (
		<BaseRelationship
			{...props}
			data={{
				...props.data,
				backgroundColor: STYLES.overridesRelationshipColor,
			}}
            labelRadius={10}
		/>
	);
};

export default OverridesRelationship;
