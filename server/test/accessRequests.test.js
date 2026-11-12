import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { OAuth2Client } from 'google-auth-library';

test('a verified applicant can sign in only after the configured owner approves', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'floo-access-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));

  process.env.GOOGLE_CLIENT_ID = 'test-client';
  process.env.SESSION_SECRET = 'test-only-signing-secret';
  process.env.ALLOWED_EMAILS = 'owner@gmail.com,existing@gmail.com';
  process.env.ACCESS_APPROVER_EMAIL = 'owner@gmail.com';
  process.env.ACCESS_REQUESTS_FILE = join(directory, 'requests.json');
  process.env.NODE_ENV = 'test';

  t.mock.method(OAuth2Client.prototype, 'verifyIdToken', async ({ idToken, audience }) => {
    assert.equal(audience, 'test-client');
    const [name, sub = name] = idToken.split('-');
    return { getPayload: () => ({ email: name + '@gmail.com', name, sub, email_verified: name !== 'unverified' }) };
  });

  const { default: app } = await import('../src/app.js');
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const login = name => fetch(base + '/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential: name + '-google-subject-test' }),
  });
  const cookie = response => response.headers.get('set-cookie')?.split(';')[0];

  assert.equal((await login('unverified')).status, 403);
  for (const response of await Promise.all([login('applicant'), login('applicant')])) {
    assert.equal(response.status, 202);
    assert.deepEqual(await response.json(), { status: 'pending' });
    assert.equal(cookie(response), undefined);
  }
  assert.equal((await fetch(base + '/orders')).status, 401);

  const owner = await login('owner');
  const regular = await login('existing');
  assert.equal((await owner.json()).user.canManageAccess, true);
  assert.equal((await regular.json()).user.canManageAccess, false);
  const list = session => fetch(base + '/access-requests', { headers: { Cookie: session } });
  assert.equal((await list(cookie(regular))).status, 403);
  const { requests } = await (await list(cookie(owner))).json();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].email, 'applicant@gmail.com');

  const approve = session => fetch(base + '/access-requests/' + requests[0].id, {
    method: 'PATCH',
    headers: { Cookie: session, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'approved' }),
  });
  assert.equal((await approve(cookie(regular))).status, 403);
  assert.equal((await approve(cookie(owner))).status, 200);
  assert.equal(JSON.parse(await readFile(process.env.ACCESS_REQUESTS_FILE, 'utf8'))[0].status, 'approved');
  assert.equal((await approve(cookie(owner))).status, 409);

  const approved = await login('applicant');
  assert.equal(approved.status, 200);
  const me = await fetch(base + '/me', { headers: { Cookie: cookie(approved) } });
  assert.equal((await me.json()).user.email, 'applicant@gmail.com');
  assert.equal((await list(cookie(approved))).status, 403);
  assert.equal((await login('applicant-other')).status, 202);
});
