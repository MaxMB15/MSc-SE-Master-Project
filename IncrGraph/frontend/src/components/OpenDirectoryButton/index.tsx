import React from "react";

interface OpenDirectoryButtonProps {
    onClick: (path: string) => void,
    style: React.CSSProperties,
    children: React.ReactNode
}

const OpenDirectoryButton: React.FC<OpenDirectoryButtonProps> = ({onClick, style, children}) => {

	const handleOpenDirectory = async () => {
		if (window.electron && window.electron.selectDirectory) {
			const result = await window.electron.selectDirectory();
            if (result.length > 0)
                onClick(result[0]);
		} else {
			console.error("Electron API is not available.");
		}
	};

	return <div style={style} onClick={handleOpenDirectory}>{children}</div>;
};

export default OpenDirectoryButton;
