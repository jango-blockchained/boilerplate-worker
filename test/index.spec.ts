import { describe, expect, test, vi, beforeEach } from 'bun:test';
import worker, { checkInternalAuth } from '../src/index';

describe('checkInternalAuth', () => {
	let mockEnv: any;

	beforeEach(() => {
		mockEnv = {
			INTERNAL_KEY_BINDING: 'test-key',
		};
	});

	test('returns error when no key configured', async () => {
		mockEnv.INTERNAL_KEY_BINDING = undefined;
		const request = new Request('http://example.com/test');
		const result = await checkInternalAuth(request, mockEnv);
		expect(result.authorized).toBe(false);
		expect(result.error).toBe('INTERNAL_KEY_BINDING not configured');
	});

	test('returns error when no key provided', async () => {
		const request = new Request('http://example.com/test');
		const result = await checkInternalAuth(request, mockEnv);
		expect(result.authorized).toBe(false);
		expect(result.error).toBe('Unauthorized');
	});

	test('returns error when key mismatch', async () => {
		const request = new Request('http://example.com/test', {
			headers: { 'X-Internal-Auth-Key': 'wrong-key' },
		});
		const result = await checkInternalAuth(request, mockEnv);
		expect(result.authorized).toBe(false);
		expect(result.error).toBe('Unauthorized');
	});

	test('returns authorized when key matches', async () => {
		const request = new Request('http://example.com/test', {
			headers: { 'X-Internal-Auth-Key': 'test-key' },
		});
		const result = await checkInternalAuth(request, mockEnv);
		expect(result.authorized).toBe(true);
	});
});

describe('Fetch Handler', () => {
	let mockEnv: any;
	let mockCtx: any;

	beforeEach(() => {
		mockEnv = {
			INTERNAL_KEY_BINDING: 'test-key',
		};
		mockCtx = { waitUntil: (p: Promise<any>) => p };
	});

	test('returns 200 on health check', async () => {
		const request = new Request('http://example.com/healthz');
		const response = await worker.fetch(request, mockEnv, mockCtx);
		expect(response.status).toBe(200);
		const json: any = await response.json();
		expect(json.status).toBe('ok');
	});

	test('returns 401 on unauthorized API request', async () => {
		const request = new Request('http://example.com/api/data');
		const response = await worker.fetch(request, mockEnv, mockCtx);
		expect(response.status).toBe(401);
	});
});
