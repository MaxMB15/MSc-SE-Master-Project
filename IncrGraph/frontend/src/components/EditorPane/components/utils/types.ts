import { Node, NodeTypes, EdgeTypes } from "reactflow";

import BaseRelationship from "../edges/BaseRelationship";
import DependencyRelationship from "../edges/DependencyRelationship";
import ExecutionRelationship from "../edges/ExecutionRelationship";
import InheritanceRelationship from "../edges/InheritanceRelationship";
import MethodRelationship from "../edges/MethodRelationship";
import OverridesRelationship from "../edges/OverridesRelationship";
import AbstractClassNode from "../nodes/AbstractClassNode";

import BaseNode from "../nodes/BaseNode";
import ClassNode from "../nodes/ClassNode";
import CodeFragmentNode from "../nodes/CodeFragmentNode";
import InterfaceNode from "../nodes/InterfaceNode";
import LibraryNode from "../nodes/LibraryNode";
import MethodNode from "../nodes/MethodNode";
import StartNode from "../nodes/StartNode";
import DocumentationNode from "../nodes/DocumentationNode";
import DocumentationRelationship from "../edges/DocumentationRelationship";

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