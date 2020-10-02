import Lsdb from "../src/lsdb";

let lsdb: Lsdb;

describe("lsdb", () => {
  beforeEach(() => {
    localStorage.clear();
    lsdb = new Lsdb("test-1");
    lsdb.collection(["test-1"]);
  });

  test("insert-count", () => {
    expect(lsdb.count("test-1")).toEqual(0);

    lsdb.insert("test-1", { data: { foo: "bar" } });

    expect(lsdb.count("test-1")).toEqual(1);

    lsdb.insert("test-1", { data: { hello: "world" } });

    expect(lsdb.count("test-1")).toEqual(2);
  });

  test("insert-all", () => {
    lsdb.insert("test-1", { data: { hello: "world" } });
    lsdb.insert("test-1", { data: { foo: "bar" } });

    lsdb.collection(["test-2", "test-3"]);

    lsdb.insert("test-2", { data: { dummy: "test" } });
    expect(lsdb.all()).toEqual({
      "test-1": [
        {
          _id: 0,
          hello: "world",
        },
        {
          _id: 1,
          foo: "bar",
        },
      ],
      "test-2": [
        {
          _id: 0,
          dummy: "test",
        },
      ],
      "test-3": [],
    });
  });

  test("insert-delete", () => {
    lsdb.insert("test-1", { data: { foo: "bar" } });
    lsdb.insert("test-1", { data: { hello: "world" } });

    lsdb.delete("test-1", {
      where: {
        _id: { $eq: 0 },
      },
    });

    expect(lsdb.all()).toEqual({
      "test-1": [
        {
          _id: 1,
          hello: "world",
        },
      ],
    });
  });

  test("insert-find", () => {
    lsdb.insert("test-1", { data: { foo: "bar" } });
    lsdb.insert("test-1", { data: { number: 50 } });

    expect(
      lsdb.find<{ foo: string }>("test-1", { where: { foo: { $eq: "dummy" } } })
    ).toEqual([]);

    expect(
      lsdb.find<{ foo: string }>("test-1", { where: { foo: { $eq: "bar" } } })
    ).toEqual([
      {
        _id: 0,
        foo: "bar",
      },
    ]);

    expect(
      lsdb.find<{ foo: string }>("test-1", { where: { foo: { $in: ["bar"] } } })
    ).toEqual([
      {
        _id: 0,
        foo: "bar",
      },
    ]);

    expect(
      lsdb.find<{ number: number }>("test-1", {
        where: { number: { $eq: 50 } },
      })
    ).toEqual([
      {
        _id: 1,
        number: 50,
      },
    ]);

    expect(
      lsdb.find<{ number: number }>("test-1", {
        where: { number: { $gt: 20 } },
      })
    ).toEqual([
      {
        _id: 1,
        number: 50,
      },
    ]);

    expect(
      lsdb.find<{ number: number }>("test-1", {
        where: { number: { $gte: 30 } },
      })
    ).toEqual([
      {
        _id: 1,
        number: 50,
      },
    ]);

    expect(
      lsdb.find<{ number: number }>("test-1", {
        where: { number: { $lt: 100 } },
      })
    ).toEqual([
      {
        _id: 1,
        number: 50,
      },
    ]);

    expect(
      lsdb.find<{ number: number }>("test-1", {
        where: { number: { $ne: 20 } },
      })
    ).toEqual([
      { _id: 0, foo: "bar" },
      {
        _id: 1,
        number: 50,
      },
    ]);
  });

  test("insert-findOne", () => {
    lsdb.insert("test-1", { data: { number: 20 } });
    lsdb.insert("test-1", { data: { number: 50 } });

    expect(
      lsdb.findOne<{ number: number }>("test-1", {
        where: { number: { $lte: 100 } },
      })
    ).toEqual({
      _id: 0,
      number: 20,
    });

    expect(
      lsdb.findOne<{}>("test-1", {
        where: {},
      })
    ).toEqual([
      { _id: 0, number: 20 },
      { _id: 1, number: 50 },
    ]);
  });

  test("insert-update", () => {
    lsdb.insert("test-1", { data: { foo: "bar" } });
    lsdb.update("test-1", { foo: "bar" }, { foo: "newBar" });

    expect(lsdb.all()).toEqual({
      "test-1": [{ _id: 0, foo: "newBar" }],
    });
  });

  test("collection", () => {
    console.error = jest.fn();

    lsdb.collection(("hello" as unknown) as string[]);

    expect(console.error).toBeCalledWith("Error: An array was expected");

    lsdb.collection((["hello", true] as unknown) as string[]);

    expect(console.error).toBeCalledWith("Error: All values must be string");
  });
});
