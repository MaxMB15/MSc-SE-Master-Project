import "./ImportNode.css";
import BaseNode, { IGCNodeProps } from "../BaseNode";
import { STYLES } from "@/styles/constants";

const ImportNode: IGCNodeProps = ( props ) => (
	<BaseNode {...props} data={{
        ...props.data,
        children: <ImportNodeDisplay />,
        backgroundColor: ImportNode.COLOR
    }}/>
);
ImportNode.NAME = "ImportNode";
ImportNode.COLOR = STYLES.importNodeColor;
ImportNode.TYPE = "node";
ImportNode.SETABLE = true;

const ImportNodeDisplay: React.FC = () => {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				height: "100%",
				position: "relative",
			}}
		>
			<img
				src="/logo.png"
				alt="Logo"
				style={{
					position: "absolute",
					top: "10px",
					left: "10px",
					width: "20px",
					height: "20px",
				}}
			/>
			<div
				style={{
					fontSize: "12px",
					textAlign: "center",
					width: "100%",
				}}
			></div>
		</div>
	);
};

export default ImportNode;
