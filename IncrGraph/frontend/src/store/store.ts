import { create } from "zustand";

interface State {
	prop1: string;
	prop2: string;
	updateProp1: (updater: (prev: string) => string) => void;
}

const useStore = create<State>((set) => ({
	prop1: "value1",
	prop2: "value2",
	updateProp1: (updater: (prev: string) => string) =>
		set((state) => ({ prop1: updater(state.prop1) })),
}));

export default useStore;
