import { db } from "./db";

export type TransactionContext = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => PromiseLike<unknown>
  ? T
  : never;
