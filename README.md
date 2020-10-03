# lsdb
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
✨Database powered by localStorage

We’ll start by setting up a database:

```
const lsdb = new Lsdb("lsdb")
```

## Creating list of collections
 ```
 lsdb.collection(["categories", "articles"])
 ```

## Inserting
```
lsdb.insert("categories", { data: { title: "Drinks" } })
lsdb.insert("categories", { data: { title: "Dinner" } })
```

## Getting data
Get all collections
```
lsdb.all()
```

Get a list of documents matching the query
```
lsdb.find("categories", {
    where: {
        title: { $in: ["er"] },
    },
})
``` 

Get a single document matching the query
```
lsdb.findOne("categories", {
    where: {
        _id: { $eq: 1 },
    },
})
```

## Removing
Remove a single document matching the query
```
lsdb.delete("categories", {
    where: {
    _id: { $eq: 1 },
    },
})
```
## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/aneeshrelan"><img src="https://avatars2.githubusercontent.com/u/17068083?v=4" width="100px;" alt=""/><br /><sub><b>Aneesh Relan</b></sub></a><br /><a href="https://github.com/buzz-js/lsdb/commits?author=aneeshrelan" title="Tests">⚠️</a> <a href="https://github.com/buzz-js/lsdb/commits?author=aneeshrelan" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!