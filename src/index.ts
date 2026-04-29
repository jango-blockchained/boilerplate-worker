import { ExecutionContext, ScheduledEvent } from '@cloudflare/workers-types';

export interface Env {
	CONFIG_KV: KVNamespace;
	INTERNAL_KEY_BINDING?: string;
	// Add other bindings here (e.g. D1_SERVICE: Fetcher)
}

export async function checkInternalAuth(request: Request, env: Env): Promise<{ authorized: boolean; error?: string }> {
	const internalKey = env.INTERNAL_KEY_BINDING;
	if (!internalKey) {
		return { authorized: false, error: 'INTERNAL_KEY_BINDING not configured' };
	}
	const providedKey = request.headers.get('X-Internal-Auth-Key');
	if (!providedKey || providedKey !== internalKey) {
		return { authorized: false, error: 'Unauthorized' };
	}
	return { authorized: true };
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Health check endpoint (unauthenticated)
		if (url.pathname === '/healthz' || url.pathname === '/health') {
			return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Example authenticated endpoint
		if (url.pathname.startsWith('/api/')) {
			const auth = await checkInternalAuth(request, env);
			if (!auth.authorized) {
				return new Response(JSON.stringify({ success: false, error: auth.error }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		}

		// Default response
		return new Response(JSON.stringify({ success: true, message: 'Boilerplate Worker is running' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	},

	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		console.log('Boilerplate Worker cron triggered at:', event.cron, event.scheduledTime);
	},
};
