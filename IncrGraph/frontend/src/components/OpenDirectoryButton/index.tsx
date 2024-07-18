import React from "react";

const OpenDirectoryButton: React.FC = () => {
	const handleOpenDirectory = async () => {
		if (window.electron && window.electron.selectDirectory) {
			const result = await window.electron.selectDirectory();
			console.log("Selected directory:", result);
		} else {
			console.error("Electron API is not available.");
		}
	};

	return <button onClick={handleOpenDirectory}>Open Directory</button>;
};

export default OpenDirectoryButton;
