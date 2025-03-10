export interface OracleCountResult {
  COUNT: number;
}

export interface OracleInsertResult {
  outBinds: [number[]];
}

export interface OracleQueryResult<T> {
  rows: T[];
  outBinds?: [number[]];
}
