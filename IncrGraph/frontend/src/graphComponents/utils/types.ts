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
import { EdgeTypes, NodeTypes } from "reactflow";

export const nodeTypes: NodeTypes = {
    [StartNode.KEY]: StartNode,
    [BaseNode.KEY]: BaseNode,
    [ClassNode.KEY]: ClassNode,
    [AbstractClassNode.KEY]: AbstractClassNode,
    [InterfaceNode.KEY]: InterfaceNode,
    [LibraryNode.KEY]: LibraryNode,
    [MethodNode.KEY]: MethodNode,
    [CodeFragmentNode.KEY]: CodeFragmentNode,
    [DocumentationNode.KEY]: DocumentationNode,
};


export const edgeTypes: EdgeTypes = {
	[BaseRelationship.KEY]: BaseRelationship,
    [InheritanceRelationship.KEY]: InheritanceRelationship,
    [OverridesRelationship.KEY]: OverridesRelationship,
    [MethodRelationship.KEY]: MethodRelationship,
    [ExecutionRelationship.KEY]: ExecutionRelationship,
    [DependencyRelationship.KEY]: DependencyRelationship,
    [DocumentationRelationship.KEY]: DocumentationRelationship,
};

// const codeContainingNodes = ["baseNode", "classNode", "abstractClassNode", "interfaceNode", "libraryNode", "methodNode", "codeFragmentNode"];

// export const isCodeContainingNode = (node: IGCNode) => {
//     return node.type !== undefined && codeContainingNodes.includes(node.type);
// }

// export const nodeHasCode = (node: IGCNode) => {
//     return isCodeContainingNode(node) && node.data !== undefined && node.data.code !== undefined && node.data.code !== "";
// }