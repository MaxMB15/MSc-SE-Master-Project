export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>;
export type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;