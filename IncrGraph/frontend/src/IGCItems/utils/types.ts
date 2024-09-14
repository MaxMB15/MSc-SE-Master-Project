import { Node, NodeTypes, EdgeTypes } from "reactflow";

import BaseRelationship from "../relationships/BaseRelationship";
import DependencyRelationship from "../relationships/DependencyRelationship";
import ExecutionRelationship from "../relationships/ExecutionRelationship";
import InheritanceRelationship from "../relationships/InheritanceRelationship";
import MethodRelationship from "../relationships/MethodRelationship";
import OverridesRelationship from "../relationships/OverridesRelationship";
import AbstractClassNode from "../nodes/AbstractClassNode";

import BaseNode from "../nodes/BaseNode";
import ClassNode from "../nodes/ClassNode";
import CodeFragmentNode from "../nodes/CodeFragmentNode";
import InterfaceNode from "../nodes/InterfaceNode";
import LibraryNode from "../nodes/LibraryNode";
import MethodNode from "../nodes/MethodNode";
import StartNode from "../nodes/StartNode";
import DocumentationNode from "../nodes/DocumentationNode";
import DocumentationRelationship from "../relationships/DocumentationRelationship";
import ImportNode from "../nodes/ImportNode";

//Base, Class, Abstract Class, Interface, Library, Method, Code Fragment
export const nodeTypes: NodeTypes = {
	startNode: StartNode,
	baseNode: BaseNode,
	classNode: ClassNode,
	abstractClassNode: AbstractClassNode,
	interfaceNode: InterfaceNode,
	libraryNode: LibraryNode,
	methodNode: MethodNode,
	codeFragmentNode: CodeFragmentNode,
    documentationNode: DocumentationNode,
    importNode: ImportNode,
};

export const edgeTypes: EdgeTypes = {
	baseRelationship: BaseRelationship,
	inheritanceRelationship: InheritanceRelationship,
	overridesRelationship: OverridesRelationship,
	methodRelationship: MethodRelationship,
	executionRelationship: ExecutionRelationship,
	dependencyRelationship: DependencyRelationship,
    documentationRelationship: DocumentationRelationship,
};

const codeContainingNodes = ["baseNode", "classNode", "abstractClassNode", "interfaceNode", "libraryNode", "methodNode", "codeFragmentNode"];

export const isCodeContainingNode = (node: Node) => {
    return node.type !== undefined && codeContainingNodes.includes(node.type);
}

export const nodeHasCode = (node: Node) => {
    return isCodeContainingNode(node) && node.data !== undefined && node.data.code !== undefined && node.data.code !== "";
}