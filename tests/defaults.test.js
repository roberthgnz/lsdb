const lsdb = require("../lib/lsdb");
const { db } = lsdb("lsdb");

test("initialize", () => {
  db.defaults({ reg: [] });
  expect(db.get("reg")).toEqual([]);
});
