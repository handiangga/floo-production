import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute } from 'node:path';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';

export const accessRequestsEnabled = Boolean(
  env.accessRequestsFile && isAbsolute(env.accessRequestsFile) &&
  env.allowedEmails.includes(env.accessApproverEmail)
);

export function canManageAccess(email) {
  return accessRequestsEnabled && email === env.accessApproverEmail;
}

async function readRequests() {
  try {
    const requests = JSON.parse(await readFile(env.accessRequestsFile, 'utf8'));
    if (!Array.isArray(requests)) throw new Error('Invalid access request file');
    return requests;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw new AppError('Penyimpanan akses sedang tidak tersedia', 503, { expose: true });
  }
}

// Serialize writes within the server process and replace the file atomically.
let writes = Promise.resolve();
function updateRequests(change) {
  const operation = writes.then(async () => {
    const requests = await readRequests();
    const { status, changed } = change(requests);
    if (!changed) return status;

    const file = env.accessRequestsFile;
    const temp = `${file}.${randomUUID()}.tmp`;
    try {
      await mkdir(dirname(file), { recursive: true, mode: 0o700 });
      await writeFile(temp, JSON.stringify(requests), { flag: 'wx', mode: 0o600 });
      await rename(temp, file);
    } catch {
      throw new AppError('Penyimpanan akses sedang tidak tersedia', 503, { expose: true });
    } finally {
      await rm(temp, { force: true }).catch(() => {});
    }
    return status;
  });
  writes = operation.catch(() => {});
  return operation;
}

export async function approvedAccess(email, subject) {
  if (!accessRequestsEnabled || !subject) return false;
  const requests = await readRequests();
  return requests.some(request =>
    request.email === email && request.subject === subject && request.status === 'approved'
  );
}

export function requestAccess({ email, name, sub: subject }) {
  // A repeated sign-in reuses the original request and cannot reset a decision.
  return updateRequests(requests => {
    const existing = requests.find(request => request.subject === subject && request.email === email);
    if (existing) return { status: existing.status };
    requests.push({ id: randomUUID(), email, name, subject, status: 'pending', createdAt: new Date().toISOString() });
    return { status: 'pending', changed: true };
  });
}

export async function pendingAccessRequests() {
  return (await readRequests())
    .filter(request => request.status === 'pending')
    .map(({ id, email, name, createdAt }) => ({ id, email, name, createdAt }));
}

export function decideAccessRequest(id, status) {
  return updateRequests(requests => {
    const request = requests.find(entry => entry.id === id);
    if (!request) throw new AppError('Permintaan akses tidak ditemukan', 404);
    if (request.status !== 'pending') throw new AppError('Permintaan ini sudah diproses', 409);
    request.status = status;
    return { status, changed: true };
  });
}
