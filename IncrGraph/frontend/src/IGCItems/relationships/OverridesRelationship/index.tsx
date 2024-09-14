import { STYLES } from "@/styles/constants";
import BaseRelationship, { IGCRelationshipProps } from "../BaseRelationship";

const OverridesRelationship: IGCRelationshipProps = (
	props,
) => {
	return (
		<BaseRelationship
			{...props}
			data={{
				...props.data,
				backgroundColor: OverridesRelationship.COLOR,
                labelRadius: 10
			}}
		/>
	);
};
OverridesRelationship.NAME = "OverridesRelationship";
OverridesRelationship.COLOR = STYLES.overridesRelationshipColor;
OverridesRelationship.TYPE = "relationship";
OverridesRelationship.SETABLE = true;

export default OverridesRelationship;

