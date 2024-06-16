import { describe, expect, it } from 'vitest';

import { SynologyClient } from './synology-client';

describe('synology-client.ts', () => {
  const client = new SynologyClient({
    endpoint: 'http://diskstation:5000',
    token: false,
    sid: false,
    name: 'SynologyClientTest',
  });

  it('should login', async () => {
    expect.assertions(1);

    const result = await client.login({
      account: 'test',
      passwd: 'test',
    });

    expect(result).toBeDefined();
  });
});
