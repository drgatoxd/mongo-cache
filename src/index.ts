import type { HydratedDocument, Model } from "mongoose";
import { Collection } from "@discordjs/collection";

export class ModelWithCache<M> {
  public constructor(public readonly model: Model<M>) {}
  protected cached = new Collection<string, HydratedDocument<M>>();

  public async get<T extends boolean>(
    id: string,
    create?: T
  ): Promise<
    T extends true ? HydratedDocument<M> : HydratedDocument<M> | null
  > {
    if (this.cached.has(id)) return this.cached.get(id)!;
    const doc = await this.model.findOne({ _id: id });
    if (doc) {
      this.cached.set(id, doc);
      return doc;
    } else if (create) {
      const newDoc = await this.model.create({ _id: id });
      this.cached.set(id, newDoc);
      await newDoc.save();
      return newDoc;
      // @ts-expect-error no me deja poner null :xd:
    } else return null;
  }

  public async find<T extends boolean>(
    query: DeepPartial<M>,
    create?: T
  ): Promise<
    T extends true ? HydratedDocument<M> : HydratedDocument<M> | null
  > {
    const doc = await this.model.findOne(query);
    if (doc) {
      this.cached.set(doc._id as string, doc);
      return doc;
    } else if (create) {
      const newDoc = await this.model.create(query);
      this.cached.set(newDoc._id as string, newDoc);
      await newDoc.save();
      return newDoc;
      // @ts-expect-error no me deja poner null :xd:
    } else return null;
  }

  public async filter(
    query: DeepPartial<M>,
    fetch?: true
  ): Promise<HydratedDocument<M>[]> {
    if (fetch) {
      const dbs = await this.model.find(query);
      if (dbs.length != this.cached.size) {
        this.cached.clear();
        dbs.forEach((db) => this.cached.set(db._id as string, db));
      }
      return dbs;
    } else {
      return this.cached
        .filter((doc) => {
          for (const [key, value] of Object.entries(query)) {
            if (doc[key as keyof typeof doc] != value) return false;
          }
          return true;
        })
        .map((doc) => doc);
    }
  }

  public async getAll(fetch?: true) {
    if (fetch) {
      const dbs = await this.model.find();
      if (dbs.length != this.cached.size) {
        this.cached.clear();
        dbs.forEach((db) => this.cached.set(db._id as string, db));
      }
      return dbs;
    } else {
      return this.cached.map((doc) => doc);
    }
  }

  public async delete(id: string) {
    this.cached.delete(id);
    await this.model.deleteOne({ _id: id });
    return true;
  }

  public async update(id: string, update: DeepPartial<M>) {
    const doc = await this.get(id);
    if (!doc) return false;

    Object.assign(doc, update);
    await doc.save();
    this.cached.set(id, doc);
    return true;
  }

  public async create(data: DeepPartial<M>) {
    const doc = await this.model.create({ ...data });
    await doc.save();
    this.cached.set(doc._id, doc);
    return doc;
  }

  public async deleteAll() {
    this.cached.clear();
    await this.model.deleteMany({});
    return true;
  }

  public async deleteWithFilter(query: DeepPartial<M>) {
    const docs = await this.filter(query);
    docs.forEach((doc) => this.cached.delete(doc._id as string));
    await this.model.deleteMany(query);
    return true;
  }
}

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
