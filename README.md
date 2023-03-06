# lsdb

[![CI](https://github.com/roberthgnz/lsdb/actions/workflows/main.yml/badge.svg)](https://github.com/roberthgnz/lsdb/actions/workflows/main.yml)
[![Issues](https://img.shields.io/github/issues/roberthgnz/lsdb)](https://github.com/roberthgnz/lsdb/issues)
[![Forks](https://img.shields.io/github/forks/roberthgnz/lsdb)](https://github.com/roberthgnz/lsdb)
[![Stars](https://img.shields.io/github/stars/roberthgnz/lsdb)](https://github.com/roberthgnz/lsdb)
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg)](#contributors-)

Typed localStorage database powered by  with JSON definition

## Features

- 📦 Tree-shakeable
- ⚡ Fast
- ✨ Lightweight
- ❤️ Strongly typed

## Installation

```bash
npm i @reliutg/lsdb
```

## With Skypack

no npm install needed!

```html
<script type="module">
  import Lsdb from 'https://cdn.skypack.dev/@reliutg/lsdb';
</script>
```

## We’ll start by setting up a database:

```js
const lsdb = new Lsdb('dbname');
```

## Creating list of collections

```js
// Create multiple collections
lsdb.collection(['categories', 'articles']);
// Create single collection
lsdb.collection('categories');
```

## Inserting

```js
lsdb.insert('categories', { title: 'Drinks' });
lsdb.insert('categories', { title: 'Dinner' });
lsdb.insert('categories', { title: 'Breakfast' });
lsdb.insert('articles', { title: 'Coffee', category: 'Drinks' });
```

```js
lsdb.insertMany('categories', [{ title: 'Drinks' }, { title: 'Dinner' }, { title: 'Breakfast' }]);
```

## Getting data

Get single collection or all collection entries

```js
lsdb.all();
// {categories: Array(2), articles: Array(0)}

lsdb.all('categories');
// [{title: 'Drinks'}, {title: 'Dinner'}, {title: 'Breakfast'}]
```

Get a list of documents

```js
lsdb.find('categories', {
  where: {
    category: { $in: ['Drinks'] },
  },
});

lsdb.find('articles', {
  where: {
    category: { $eq: 'Drinks' },
  },
});

lsdb.find('articles', {
  sort: {
    field: 'title',
    order: 'asc'
  },
  limit: 2,
  skip: 1,
});
```

### Find Options

| Field   | Type     | Description             | Default     | Required |
| ------- | -------- | ----------------------- | ----------- | -------- |
| `where` | `Object`   | Filter by object        | `undefined` | `false`  |
| `sort`  | `Object` | Sort by field name      | `undefined` | `false`  |
| `limit` | `number` | Limit number of results | `undefined` | `false`  |
| `skip`  | `number` | Skip number of results  | `0`         | `false`  |

### Available operators for where

Based on [MongoDB](https://docs.mongodb.com/manual/reference/operator/query/#query-selectors) query selectors

- `$eq` - Equal
- `$in` - In
- `$nin` - Not in
- `$ne` - Not equal
- `$gt` - Greater than
- `$gte` - Greater than or equal
- `$lt` - Less than
- `$lte` - Less than or equal

Get a single document matching the query

```js
lsdb.findOne('categories', {
  where: {
    _id: { $eq: id },
  },
});
```

## Updating

Update a single document matching the query

```js
lsdb.update('categories', {
  where: {
    _id: { $eq: id },
  },
});
```

## Removing

Remove a single document matching the query

```js
lsdb.delete('categories', {
  where: {
    _id: { $eq: id },
  },
});
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/aneeshrelan"><img src="https://avatars2.githubusercontent.com/u/17068083?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aneesh Relan</b></sub></a><br /><a href="https://github.com/roberthgnz/lsdb/commits?author=aneeshrelan" title="Tests">⚠️</a> <a href="https://github.com/roberthgnz/lsdb/commits?author=aneeshrelan" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/fr0stylo"><img src="https://avatars0.githubusercontent.com/u/13507123?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Zymantas Maumevicius</b></sub></a><br /><a href="#infra-fr0stylo" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/roberthgnz/lsdb/commits?author=fr0stylo" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/dekpient"><img src="https://avatars1.githubusercontent.com/u/717270?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nitkalya Wiriyanuparb</b></sub></a><br /><a href="https://github.com/roberthgnz/lsdb/commits?author=dekpient" title="Tests">⚠️</a> <a href="https://github.com/roberthgnz/lsdb/commits?author=dekpient" title="Code">💻</a></td>
    <td align="center"><a href="https://connorruggles.dev"><img src="https://avatars0.githubusercontent.com/u/14317362?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Connor Ruggles</b></sub></a><br /><a href="#infra-rugglcon" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/roberthgnz/lsdb/commits?author=rugglcon" title="Code">💻</a></td>
    <td align="center"><a href="https://smakss.github.io/"><img src="https://avatars0.githubusercontent.com/u/32557358?v=4?s=100" width="100px;" alt=""/><br /><sub><b>MAKSS</b></sub></a><br /><a href="https://github.com/roberthgnz/lsdb/commits?author=SMAKSS" title="Documentation">📖</a></td>
    <td align="center"><a href="http://bit.ly/vvscodeli"><img src="https://avatars.githubusercontent.com/u/6904368?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vasiliy Vanchuk</b></sub></a><br /><a href="https://github.com/roberthgnz/lsdb/commits?author=vvscode" title="Code">💻</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/pablo-marcelo-bianco/"><img src="https://avatars.githubusercontent.com/u/358126?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pablo</b></sub></a><br /><a href="https://github.com/roberthgnz/lsdb/commits?author=marce1994" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
