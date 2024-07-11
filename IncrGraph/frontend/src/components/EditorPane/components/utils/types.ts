import { NodeTypes, EdgeTypes } from "reactflow";

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
};

export const edgeTypes: EdgeTypes = {
	baseRelationship: BaseRelationship,
	inheritanceRelationship: InheritanceRelationship,
	overridesRelationship: OverridesRelationship,
	methodRelationship: MethodRelationship,
	executionRelationship: ExecutionRelationship,
	dependencyRelationship: DependencyRelationship,
};