import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import "./FileEditor.css";

const FileEditor: React.FC<{ editorPaneWidth: number }> = ({ editorPaneWidth }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="file-editor-container" style={{ width: isCollapsed ? 40 : `calc(100% - ${editorPaneWidth}px)` }}>
            <div className={`file-editor ${isCollapsed ? "collapsed" : ""}`}>
                <div className={`navbar ${isCollapsed ? "collapsed" : ""}`}>
                    {!isCollapsed && (
                        <span className="directory-name">File Editor</span>
                    )}
                    <button className="icon-button" title="Toggle Visibility" onClick={toggleCollapse}>
                        <VisibilityIcon />
                    </button>
                </div>
                {!isCollapsed && (
                    <Box sx={{ flexGrow: 1, backgroundColor: "#1e1e1e", overflowY: "auto" }}>
                        {/* File editor content goes here */}
                    </Box>
                )}
            </div>
        </div>
    );
};

export default FileEditor;
