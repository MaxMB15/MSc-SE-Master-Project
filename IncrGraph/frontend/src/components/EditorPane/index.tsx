import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import "./EditorPane.css";

const EditorPane: React.FC = () => {
	const [width, setWidth] = useState(600); // Initial width of 600px

	return (
		<div className="editor-pane-container">
			<ResizableBox
				width={width}
				height={Infinity}
				axis="x"
				minConstraints={[200, Infinity]}
				maxConstraints={[1200, Infinity]}
				onResize={(event, { size }) => setWidth(size.width)}
				resizeHandles={["e"]}
				handle={
					<div className="resize-handle-container">
						<div
							className="resize-handle"
							style={{
								cursor: "ew-resize",
								height: "100%",
								width: "5px",
								position: "absolute",
								right: 0,
								top: 0,
								backgroundColor: "transparent",
							}}
						/>
					</div>
				}
			>
				<div className="editor-pane" style={{ width }}>
					<div className="navbar">
						<span className="directory-name">Editor Pane</span>
					</div>
					<Box
						sx={{
							flexGrow: 1,
							backgroundColor: "#1e1e1e",
							overflowY: "auto",
						}}
					>
						{/* Editor content goes here */}
					</Box>
				</div>
			</ResizableBox>
		</div>
	);
};

export default EditorPane;
