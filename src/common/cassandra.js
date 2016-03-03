import { Client } from 'cassandra-driver';
import Promise from 'bluebird';

// Create a singleton client instance with its methods promisified (i.e. gives us methods like executeAsync)
export const cassandra = Promise.promisifyAll(
  new Client({
    // TODO: Make this configurable
    contactPoints: [ '192.168.56.20' ],
    queryOptions: {
      prepare: true
    }
  })
);