# lsdb
✨Database powered by localStorage

## Inserting
```
db.insert("restaurants", { data: { name: "Chucho" } });
```

## Getting data
Get all collections
```
db.all()
```

Get all documents
```
db.get("restaurants")
```
Get a list of documents matching the query
```
db.find(categories{
    collection: "restaurants",
    field: "name",
    operator: "eq",
    value: "Chucha",
})
``` 

Get a single document matching the query
```
db.findOne({
    collection: "restaurants",
    field: "name",
    operator: "ne",
    value: "Chucha",
})
```

## Removing
Remove a single document matching the query
```
db.remove("restaurants", { name: "Chucha" });
```