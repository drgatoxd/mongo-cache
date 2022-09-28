# 🌿 mongo-cache

### Install

```bash
$ npm install mongo-cache // with npm
$ yarn add mongo-cache // with yarn
$ pnpm add mongo-cache // with pnpm
```

### Usage

```js
// your-model.js
const { ModelWithCache } = require("mongo-cache");
const { Schema, model } = require("mongoose");

const yourSchema = new Schema({
  name: String,
  age: Number,
  _id: String, // set id if you want to use it as cache key
});

const yourModel = model("YourModelName", yourSchema);

module.exports = new ModelWithCache(yourModel);
```

```js
// idk.js
const model = require("../path/to/your-model");

async function maybeMain() {
  // create document
  const doc = await model.create({ name: "John", age: 20 });

  // get all documents
  const docs = await model.getAll(true); // true to skip cache

  // get all documents with filter
  const docs = await model.filter({ name: "John" }, true); // true to skip cache

  // get document by id
  const docById = await model.get(doc._id, true); // true to create if not exists

  // get document by query
  const docByQuery = await model.find({ name: "John" }, true); // true to create if not exists

  // update document
  const updatedDoc = await model.update(doc._id, { age: 21 });
  /* or... */
  doc.age = 21;
  const updatedDoc = await model.update(doc._id, doc);
  /* ❌ if you use <Document>.save(), the document won't be cached ❌ */

  // delete document
  await model.delete(doc._id);

  // delete all documents
  await model.deleteAll();

  // delete all documents with filter
  await model.deleteWithFilter({ name: "John" });
}
```

> no se si tiene bugs xd
