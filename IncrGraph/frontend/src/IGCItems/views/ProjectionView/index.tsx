import { IGCViewProps } from "../BaseView";
import { createView } from "@/utils/componentCache";
import { RegistryComponent } from "@/types/frontend";
import React, { useEffect, useState } from "react";
import CodeNode, {
    IGCCodeNodeData,
    isCodeNode,
} from "@/IGCItems/nodes/CodeNode";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Node } from "reactflow";
import {
    IGCDocumentationData,
    isDocumentationNode,
} from "@/IGCItems/nodes/DocumentationNode";
import ReactMarkdown from "react-markdown";
import { Editor } from "@monaco-editor/react";
import useStore from "@/store/store";
import { getExecutionPathFromSession } from "@/utils/sessionHandler";
import { getIncomingNodes } from "@/IGCItems/utils/utils";

const StyledToggleButton = styled(ToggleButton)({
    "&.Mui-selected": {
        backgroundColor: "var(--primary)",
    },
});

const RawProjectionView: React.FC = () => {
    const [mode, setMode] = useState<"Execution" | "Dependency" | "Class">("Execution");
    const [display, setDisplay] = useState<string[]>(["Code"]);
    const [view, setView] = useState<JSX.Element[]>([]);

    const sessionData = useStore((state) => state.sessionData);
    const handleModeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setMode(event.target.value as "Execution" | "Dependency" | "Class");
    };

    const handleDisplayChange = (
        event: React.MouseEvent<HTMLElement>,
        newDisplay: string[],
    ) => {
        if (newDisplay !== null) {
            setDisplay(newDisplay);
        }
    };

    const renderContent = async (): Promise<JSX.Element[]> => {
        switch (mode) {
            case "Execution":
                return await renderExecutionContent();
            case "Dependency":
                return [renderDependencyContent()];
            case "Class":
                return [renderClassContent()];
            default:
                return [<div key="default">Select a mode to view content.</div>];
        }
    };

    const renderExecutionContent = async () => {
        const selectedFile = useStore.getState().selectedFile;
        const currentSessionId = useStore.getState().currentSessionId;

        if (selectedFile === null) {
            return [<div key="no-file">Select a file to view content.</div>];
        }
        if (currentSessionId === null) {
            return [<div key="no-session">Select a session to view content.</div>];
        }

        const executionPath = await getExecutionPathFromSession(selectedFile, currentSessionId);
        const nodes = useStore.getState().getNodes(selectedFile);
        const codeNodes = executionPath.map((nodeId) =>
            nodes.find((node) => isCodeNode(node) && node.id === nodeId)
        );
        const documentationNodes = codeNodes.map((codeNode) =>
            codeNode
                ? getIncomingNodes(
                      codeNode.id,
                      nodes,
                      useStore.getState().getEdges(selectedFile),
                      isDocumentationNode,
                  )[0]
                : undefined
        );

        return renderNodeData(documentationNodes, codeNodes);
    };

    const renderDependencyContent = () => {
        return <div>Dependency Content: {display.join(", ")}</div>;
    };

    const renderClassContent = () => {
        return <div>Class Content: {display.join(", ")}</div>;
    };

    const renderNodeData = (
        documentationNodes: (Node<IGCDocumentationData> | undefined)[],
        codeNodes: (Node<IGCCodeNodeData> | undefined)[]
    ) => {
        return documentationNodes.map((docNode, index) => {
            const codeNode = codeNodes[index];

            if (!docNode && !codeNode) return null; // Avoid rendering empty elements

            // Calculate the height for the Monaco Editor based on the number of lines in the code
            const codeContent = codeNode?.data.codeData.code || "";
            const lineCount = codeContent.split('\n').length;
            const editorHeight = Math.min(Math.max(lineCount * 19, 100), 500); // Min height of 100px, max of 500px

            return (
                <div key={index} style={{ marginBottom: "20px" }}>
                    {docNode && <ReactMarkdown>{docNode.data.documentation}</ReactMarkdown>}
                    {codeNode && (
                        <Editor
                            height={`${editorHeight}px`}
                            language="python"
                            value={codeContent}
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                            }}
                            theme={useStore.getState().mode === "dark" ? "vs-dark" : "light"}
                        />
                    )}
                </div>
            );
        });
    };

    useEffect(() => {
        let isMounted = true;
        renderContent().then((content) => {
            if (isMounted) {
                setView(content);
            }
        });
        return () => {
            isMounted = false; // Cleanup to avoid setting state if component is unmounted
        };
    }, [mode, display]);

    return (
        <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FormControl variant="outlined" size="small" style={{ flexGrow: 1 }}>
                    <InputLabel>Mode</InputLabel>
                    <Select value={mode} onChange={handleModeChange} label="Mode">
                        <MenuItem value="Execution">Execution</MenuItem>
                        <MenuItem value="Dependency">Dependency</MenuItem>
                        <MenuItem value="Class">Class</MenuItem>
                    </Select>
                </FormControl>
                <ToggleButtonGroup
                    value={display}
                    onChange={handleDisplayChange}
                    aria-label="display selection"
                    size="small"
                >
                    <StyledToggleButton value="Documentation">Documentation</StyledToggleButton>
                    <StyledToggleButton value="Code">Code</StyledToggleButton>
                </ToggleButtonGroup>
            </div>
            <div style={{ flex: 1, overflowY: "auto", height: "100%" }}>{view}</div>
        </div>
    );
};

const ProjectionView: IGCViewProps & RegistryComponent = createView(
    RawProjectionView,
    "ProjectionView",
    "Projection View",
    [CodeNode],
    10,
    {}
);

export default ProjectionView;
