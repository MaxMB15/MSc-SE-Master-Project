/** DEFINITIONS FOR GRAPH-BASED STRUCTURE */
// Define possible types for nodes
export type NodeType =
	| "CodeFragment"
	| "Class"
	| "Method"
	| "Library"
	| "Package"
	| "AbstractClass"
	| "Interface"
	| "Custom";

// Define possible types for relationships between nodes
export type RelationshipType =
	| "Inheritance"
	| "Method"
	| "Override"
	| "Dependency"
	| "ExecutionPath"
	| "Custom";

// Interface for a basic node
export interface Node {
	id: string;
	type: NodeType;
	label: string;
	children?: Node[];
	versions: NodeVersion[];
	currentVersion: string; // Id of the currently selected version
}

// Interface for a node version
export interface NodeVersion {
	id: string;
	label: string;
	description?: string;
	codeSnippet?: string;
	metadata?: Record<string, any>;
}

// Interface for different types of nodes
export interface CodeFragmentNode extends Node {
	type: "CodeFragment";
}

// Need to think about how to represent properties
export interface ClassNode extends Node {
	type: "Class";
	methods: MethodNode[];
}

export interface MethodNode extends Node {
	type: "Method";
	parameters: string[];
	returnType: string;
}

// Need to figure out how to import this
export interface LibraryNode extends Node {
	type: "Library";
	classes?: ClassNode[];
	functions?: CodeFragmentNode[];
}

export interface PackageNode extends Node {
	type: "Package";
	libraries: LibraryNode[];
}

export interface AbstractClassNode extends Node {
	type: "AbstractClass";
	abstractMethods: MethodNode[];
}

export interface InterfaceNode extends Node {
	type: "Interface";
	methods: MethodNode[];
}

// Interface for an edge representing a relationship between nodes
export interface Edge {
	id: string;
	from: string;
	to: string;
	type: RelationshipType;
	label?: string;
}

// Interface for the graph structure
export interface Graph {
	nodes: Node[];
	edges: Edge[];
}

// EXAMPLE GRAPH
const example: Graph = {
	nodes: [
		{
			id: "1",
			type: "Class",
			label: "User",
			properties: ["name", "email"],
			methods: [
				{
					id: "1.1",
					type: "Method",
					label: "__init__",
					returnType: "None",
					parameters: ["self", "name", "email"],
					versions: [
						{
							id: "v1",
							label: "Initial version",
							codeSnippet:
								"def __init__(self, name, email):\n    self.name = name\n    self.email = email",
						},
					],
					currentVersion: "v1",
				},
				{
					id: "1.2",
					type: "Method",
					label: "get_name",
					returnType: "str",
					parameters: ["self"],
					versions: [
						{
							id: "v1",
							label: "Initial version",
							codeSnippet:
								"def get_name(self):\n    return self.name",
						},
						{
							id: "v2",
							label: "Refactored version",
							codeSnippet:
								"def get_name(self):\n    return self.full_name",
						},
					],
					currentVersion: "v2",
				},
			],
			versions: [
				{
					id: "v1",
					label: "Initial version",
					description: "Represents a user in the system",
					codeSnippet: "class User:",
				},
				{
					id: "v2",
					label: "Updated version",
					description: "Represents a user with additional properties",
					codeSnippet: "class User:\n    self.full_name = None",
				},
			],
			currentVersion: "v1",
		} as ClassNode,
		{
			id: "2",
			type: "Class",
			label: "Admin",
			properties: ["permissions"],
			methods: [
				{
					id: "2.1",
					type: "Method",
					label: "__init__",
					returnType: "None",
					parameters: ["self", "name", "email", "permissions"],
					versions: [
						{
							id: "v1",
							label: "Initial version",
							codeSnippet:
								"def __init__(self, name, email, permissions):\n    super().__init__(name, email)\n    self.permissions = permissions",
						},
					],
					currentVersion: "v1",
				},
			],
			versions: [
				{
					id: "v1",
					label: "Initial version",
					description: "Represents an admin user in the system",
					codeSnippet: "class Admin(User):",
				},
			],
			currentVersion: "v1",
		} as ClassNode,
	],
	edges: [
		{
			id: "1-2",
			from: "1",
			to: "2",
			type: "Inheritance",
			label: "inherits",
		},
	],
};
