import _ from "lodash";

export const applyFilter = (data: any, filters: string[]): any => {
	const clonedData = _.cloneDeep(data);

	const parsedFilters = filters.map((filter) => filter.split("."));

	const removeKeys = (obj: any, keys: string[][]) => {
		if (!keys.length || !obj) return;

		const keyMap = keys.reduce((map, key) => {
			if (!map[key[0]]) map[key[0]] = [];
			if (key.length > 1) map[key[0]].push(key.slice(1));
			return map;
		}, {} as Record<string, string[][]>);

		Object.keys(keyMap).forEach((key) => {
			if (Array.isArray(obj[key])) {
				obj[key].forEach((item: any) => removeKeys(item, keyMap[key]));
			} else if (keyMap[key].length) {
				removeKeys(obj[key], keyMap[key]);
			} else {
				delete obj[key];
			}
		});
	};

	removeKeys(clonedData, parsedFilters);

	return clonedData;
};

export const mergeChanges = (
	original: any,
	filtered: any,
	filters: string[],
): any => {
	const clonedOriginal = _.cloneDeep(original);
	const parsedFilters = filters.map((filter) => filter.split("."));

	const mergeKeys = (obj: any, updatedObj: any, keys: string[][]) => {
		if (!keys.length || !obj || !updatedObj) return;

		const keyMap = keys.reduce((map, key) => {
			if (!map[key[0]]) map[key[0]] = [];
			if (key.length > 1) map[key[0]].push(key.slice(1));
			return map;
		}, {} as Record<string, string[][]>);

		Object.keys(keyMap).forEach((key) => {
			if (Array.isArray(obj[key])) {
				obj[key].forEach((item: any, index: number) =>
					mergeKeys(item, updatedObj[key][index], keyMap[key]),
				);
			} else if (keyMap[key].length) {
				mergeKeys(obj[key], updatedObj[key], keyMap[key]);
			} else {
				obj[key] = updatedObj[key];
			}
		});
	};

	mergeKeys(clonedOriginal, filtered, parsedFilters);

	return clonedOriginal;
};
