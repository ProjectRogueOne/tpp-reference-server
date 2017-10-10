const { set, get, drop } = require('../app/storage.js');
const assert = require('assert');
// const error = require('debug')('error');

describe('storage set data with id', () => {
  const collection = 'test-auth-servers';
  const orgId = 'bbbccc-example-org';
  const data = {
    BaseApiDNSUri: 'http://bbb.example.com',
    CustomerFriendlyLogoUri: 'string',
    CustomerFriendlyName: 'BBB Example Bank',
  };
  const id = `${orgId}-${data.BaseApiDNSUri}`;

  it('get with invalid id returns null', async () => {
    await set(collection, data, id);
    const result = await get(collection, 'bad-id');
    return assert.equal(null, result);
  });

  it('get with id returns same data', async () => {
    await set(collection, data, id);
    const expected = Object.assign({ id }, data);
    const result = await get(collection, id);
    return assert.deepEqual(expected, result);
  });

  it('called second time overwrites data', async () => {
    const newData = Object.assign(data, { CustomerFriendlyName: 'New Name' });

    await set(collection, data, id);
    await set(collection, newData, id);

    const expected = Object.assign({ id }, newData);
    const result = await get(collection, id);
    return assert.deepEqual(expected, result);
  });

  after(() => {
    drop(collection);
  });
});
