# lsdb
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