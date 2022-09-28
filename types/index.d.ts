import type { HydratedDocument, Model } from "mongoose";
import { Collection } from "@discordjs/collection";
export declare class ModelWithCache<M> {
    readonly model: Model<M>;
    constructor(model: Model<M>);
    protected cached: Collection<string, HydratedDocument<M, {}, {}>>;
    get<T extends boolean>(id: string, create?: T): Promise<T extends true ? HydratedDocument<M> : HydratedDocument<M> | null>;
    find<T extends boolean>(query: DeepPartial<M>, create?: T): Promise<T extends true ? HydratedDocument<M> : HydratedDocument<M> | null>;
    filter(query: DeepPartial<M>, fetch?: true): Promise<HydratedDocument<M>[]>;
    getAll(fetch?: true): Promise<HydratedDocument<M, {}, {}>[]>;
    delete(id: string): Promise<boolean>;
    update(id: string, update: DeepPartial<M>): Promise<boolean>;
    create(data: DeepPartial<M>): Promise<HydratedDocument<M, {}, {}>>;
    deleteAll(): Promise<boolean>;
    deleteWithFilter(query: DeepPartial<M>): Promise<boolean>;
}
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export {};
