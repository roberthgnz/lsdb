# lsdb
✨Database powered by localStorage

We’ll start by setting up a database:

```
const lsdb = new Lsdb("lsdb"); 
```

## Creating list of collections
 ```
 lsdb.collection(["categories", "articles"]);
 ```

## Inserting
```
lsdb.insert("categories", { data: { title: "Drinks" } });
lsdb.insert("categories", { data: { title: "Dinner" } });
```

## Getting data
Get all collections
```
lsdb.all()
```

Get all documents
```
lsdb.get("restaurants")
```
Get a list of documents matching the query
```
lsdb.find("categories", {
    where: {
        field: "title",
        operator: "in",
        value: "er",
    },
})
``` 

Get a single document matching the query
```
lsdb.findOne("categories", {
    where: {
        field: "title",
        operator: "in",
        value: "er",
    },
})
```

## Removing
Remove a single document matching the query
```
lsdb.remove("restaurants", { name: "Chucha" });
```