import { STYLES } from "@/styles/constants";
import BaseRelationship, { IGCRelationshipProps } from "../BaseRelationship";

const InheritanceRelationship: IGCRelationshipProps = (
	props,
) => {
	return (
		<BaseRelationship
			{...props}
			data={{
				...props.data,
				backgroundColor: InheritanceRelationship.COLOR,
                labelRadius: 10
			}}
		/>
	);
};
InheritanceRelationship.NAME = "InheritanceRelationship";
InheritanceRelationship.COLOR = STYLES.inheritanceRelationshipColor;
InheritanceRelationship.TYPE = "relationship";
InheritanceRelationship.SETABLE = true;

export default InheritanceRelationship;
