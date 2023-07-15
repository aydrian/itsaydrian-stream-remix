export type ResolvedRemixLoader<T extends (...args: any) => any> = Awaited<
  ReturnType<Awaited<ReturnType<T>>["json"]>
>;
