import Lsdb from '../src/index';

let lsdb: Lsdb;

class LocalStorageMock {
  private store: { [key: string]: string };

  get length(): number {
    return Object.keys(this.store).length;
  }

  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string): any {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  // When passed a number n, this method will return the name of the nth key in the storage.
  key(n: number): string | null {
    const keys = Object.keys(this.store);
    return keys[n] || null;
  }
}

global.localStorage = new LocalStorageMock();

describe('lsdb', () => {
  beforeEach(() => {
    localStorage.clear();
    lsdb = new Lsdb('test-1');
    lsdb.collection(['test-1']);
  });

  test('insert-count', () => {
    expect(lsdb.count('test-1')).toEqual(0);

    lsdb.insert('test-1', { foo: 'bar' });

    expect(lsdb.count('test-1')).toEqual(1);

    lsdb.insert('test-1', { hello: 'world' });

    expect(lsdb.count('test-1')).toEqual(2);
  });

  test('insert-all', () => {
    const hello = lsdb.insert('test-1', { hello: 'world' });
    const foo = lsdb.insert('test-1', { foo: 'bar' });

    lsdb.collection(['test-2', 'test-3']);

    const dummy = lsdb.insert('test-2', { dummy: 'test' });

    expect(lsdb.all()).toEqual({
      'test-1': [
        {
          _id: hello._id,
          hello: 'world',
        },
        {
          _id: foo._id,
          foo: 'bar',
        },
      ],
      'test-2': [
        {
          _id: dummy._id,
          dummy: 'test',
        },
      ],
      'test-3': [],
    });
  });

  test('insert-delete', () => {
    const foo = lsdb.insert('test-1', { foo: 'bar' });

    const hello = lsdb.insert('test-1', { hello: 'world' });

    lsdb.delete('test-1', {
      where: {
        _id: { $eq: foo._id },
      },
    });

    expect(lsdb.all('test-1')).toEqual([
      {
        _id: hello._id,
        hello: 'world',
      },
    ]);
  });

  test('insert-find', () => {
    const foobar = lsdb.insert('test-1', { foo: 'bar' });
    const num = lsdb.insert('test-1', { number: 50 });
    const foodinner = lsdb.insert('test-1', { foo: 'Dinner' });
    const foodrink = lsdb.insert('test-1', { foo: 'Drink' });
    const arr = lsdb.insert('test-1', {
      food: ['Pizza', 'Cheese'],
      need: 'Drink',
    });

    expect(lsdb.find('test-1', { where: { foo: { $eq: 'dummy' } } })).toEqual([]);

    expect(lsdb.find('test-1', { where: { foo: { $eq: 'bar' } } })).toEqual([
      {
        _id: foobar._id,
        foo: 'bar',
      },
    ]);

    expect(lsdb.find('test-1', { where: { food: { $in: ['Pizza'] } } })).toEqual([
      {
        _id: arr._id,
        food: ['Pizza', 'Cheese'],
        need: 'Drink',
      },
    ]);

    expect(lsdb.find('test-1', { where: { food: { $in: ['Pizza'] } } })).toEqual([
      {
        _id: arr._id,
        food: ['Pizza', 'Cheese'],
        need: 'Drink',
      },
    ]);

    expect(lsdb.find('test-1', { where: { food: { $nin: ['Cheese'] } } })).toEqual([
      { _id: foobar._id, foo: 'bar' },
      { _id: num._id, number: 50 },
      { _id: foodinner._id, foo: 'Dinner' },
      { _id: foodrink._id, foo: 'Drink' },
    ]);

    expect(lsdb.find('test-1', { where: { food: { $nin: ['Cheese'] } }, limit: 10 })).toEqual([
      { _id: foobar._id, foo: 'bar' },
      { _id: num._id, number: 50 },
      { _id: foodinner._id, foo: 'Dinner' },
      { _id: foodrink._id, foo: 'Drink' },
    ]);

    expect(lsdb.find('test-1', { where: { food: { $nin: ['Ch'] } }, limit: 3 })).toEqual([
      { _id: foobar._id, foo: 'bar' },
      { _id: num._id, number: 50 },
      { _id: foodinner._id, foo: 'Dinner' },
    ]);

    expect(lsdb.find('test-1', { where: { food: { $nin: ['Cheese'] } } })).toEqual([
      { _id: foobar._id, foo: 'bar' },
      { _id: num._id, number: 50 },
      { _id: foodinner._id, foo: 'Dinner' },
      { _id: foodrink._id, foo: 'Drink' },
    ]);

    // expect(lsdb.find('test-1', { where: { food: { $nin: ['Drink', 'Pizza'] } } })).toEqual([
    //   { _id: foobar._id, foo: 'bar' },
    //   { _id: num._id, number: 50 },
    //   { _id: foodinner._id, foo: 'Dinner' },
    // ]);

    expect(lsdb.find('test-1', { where: { number: { $nin: [50] } } })).toEqual([
      { _id: foobar._id, foo: 'bar' },
      { _id: foodinner._id, foo: 'Dinner' },
      { _id: foodrink._id, foo: 'Drink' },
      {
        _id: arr._id,
        food: ['Pizza', 'Cheese'],
        need: 'Drink',
      },
    ]);

    expect(lsdb.find('test-1', { where: { uknown_field: { $nin: ['any_value'] } } })).toEqual([
      { _id: foobar._id, foo: 'bar' },
      { _id: num._id, number: 50 },
      { _id: foodinner._id, foo: 'Dinner' },
      { _id: foodrink._id, foo: 'Drink' },
      {
        _id: arr._id,
        food: ['Pizza', 'Cheese'],
        need: 'Drink',
      },
    ]);

    expect(lsdb.find('test-1', { where: { foo: { $in: ['Dinner', 'Drink'] } } })?.length).toEqual(2);

    expect(
      lsdb.find('test-1', {
        where: { foo: { $in: ['ri', 'er'] } },
      }),
    ).toEqual([]);

    expect(
      lsdb.find('test-1', {
        where: { number: { $eq: 50 } },
      }),
    ).toEqual([
      {
        _id: num._id,
        number: 50,
      },
    ]);

    expect(
      lsdb.find('test-1', {
        where: { number: { $gt: 20 } },
      }),
    ).toEqual([
      {
        _id: num._id,
        number: 50,
      },
    ]);

    expect(
      lsdb.find('test-1', {
        where: { number: { $gte: 30 } },
      }),
    ).toEqual([
      {
        _id: num._id,
        number: 50,
      },
    ]);

    expect(
      lsdb.find('test-1', {
        where: { number: { $lt: 100 } },
      }),
    ).toEqual([
      {
        _id: num._id,
        number: 50,
      },
    ]);

    expect(
      lsdb.find('test-1', {
        where: { number: { $ne: 20 } },
      }),
    ).toEqual([
      { _id: foobar._id, foo: 'bar' },
      {
        _id: num._id,
        number: 50,
      },
      {
        _id: foodinner._id,
        foo: 'Dinner',
      },
      {
        _id: foodrink._id,
        foo: 'Drink',
      },
      {
        _id: arr._id,
        food: ['Pizza', 'Cheese'],
        need: 'Drink',
      },
    ]);
  });

  test('insert-findOne', () => {
    const n1 = lsdb.insert('test-1', { number: 20 });
    const n2 = lsdb.insert('test-1', { number: 50 });

    expect(
      lsdb.findOne('test-1', {
        where: { number: { $lte: 100 } },
      }),
    ).toEqual({
      _id: n1._id,
      number: 20,
    });

    expect(
      lsdb.findOne('test-1', {
        where: {},
      }),
    ).toEqual(undefined);
  });

  test('insert-update', () => {
    lsdb.insert('test-1', { foo: 'bar' });
    const fooUp = lsdb.update('test-1', { foo: 'bar' }, { foo: 'newBar' });

    expect(lsdb.all()).toEqual({
      'test-1': [{ _id: fooUp._id, foo: 'newBar' }],
    });
  });

  test('collection', () => {
    let res = lsdb.collection('hello' as unknown as string[]);

    expect(res).toEqual({
      error: 'Invalid data',
    });

    res = lsdb.collection(['hello', true] as unknown as string[]);

    expect(res).toEqual({ error: 'All values must be string' });
  });
});
