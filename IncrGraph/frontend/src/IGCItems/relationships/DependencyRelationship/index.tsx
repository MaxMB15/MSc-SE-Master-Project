import { STYLES } from "@/styles/constants";
import BaseRelationship, { IGCRelationshipProps } from "../BaseRelationship";

const DependencyRelationship: IGCRelationshipProps = (
	props,
) => {
	return (
		<BaseRelationship
			{...props}
			data={{
				...props.data,
				backgroundColor: DependencyRelationship.COLOR,
                labelRadius: 5
			}}
		/>
	);
};
DependencyRelationship.NAME = "DependencyRelationship";
DependencyRelationship.COLOR = STYLES.dependencyRelationshipColor;
DependencyRelationship.TYPE = "relationship";
DependencyRelationship.SETABLE = true;

export default DependencyRelationship;
