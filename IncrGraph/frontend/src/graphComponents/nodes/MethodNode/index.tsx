import "./MethodNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCCodeNodeProps } from "../IGCNode";
import IGCRelationship from "@/graphComponents/relationships/IGCRelationship";
import { CodeAnalysisResponse, CodeExecutionResponse } from "shared";
import useStore from "@/store/store";
import { callExecute } from "@/requests";
import { Analysis } from "@/types/frontend";

interface MethodNodeProps {}

export default class MethodNode extends IGCCodeNode implements MethodNodeProps {

    scope: string[];

    constructor(props: IGCCodeNodeProps, code: string) {
        super(props, MethodNode.KEY, STYLES.methodNodeColor, code);
        this.scope = [];
    }
    // Override methods
    public executeCode(): Promise<CodeExecutionResponse> {
		const { projectDirectory, currentSessionId } = useStore.getState();

		if (projectDirectory === null) {
			return Promise.reject("Project directory not set");
		}
		return callExecute(
			this.scope.length > 0 ? IGCCodeNode.injectCode(this.code, this.scope[0]) : this.code,
			"python",
			projectDirectory,
			currentSessionId,
		);
	}

    public updateAnalysis(): Promise<CodeAnalysisResponse> {
        return super.updateAnalysis().then((response) => {
            if(this.scope.length > 0) {
                const r = Analysis.setScope(response, this.scope[0]);
                this.analysis.definitions = r.definitions;
                this.analysis.dependencies = r.dependencies;
            }
            return response;
        });

    }

    // Implement abstract methods
    public deserialize(): string {
        // Implementation of deserialize
        return "";
    }

    public metaAnalysis(): void {
        if (this.getDefinitions().functions.length > 0) {
            this.data.label = this.getDefinitions().functions[0];
        }
    }


    public createRelationships(edges: IGCRelationship[]): IGCRelationship[] {
        // Implementation of createRelationships
        return edges;
    }

    public static KEY = "MethodNode";
}
