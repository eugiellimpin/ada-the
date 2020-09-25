export type ById<T> = { [id: string]: T };
export function byId<T extends { id: any }>(objs: T[]): ById<T> {
  // turn [{ id: any, ... }, ...] => { id: { id: any... }, ...} for easier
  // access

  return objs.reduce((db: ById<T>, obj: T) => {
    db[obj.id] = obj;
    return db;
  }, {});
}
