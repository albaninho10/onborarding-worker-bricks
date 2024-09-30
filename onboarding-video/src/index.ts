export interface Env {
	DB: D1Database;
}

interface OnboardingVideo {
	[key: string]: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const userUuid = url.pathname.split('/')[1];

		if (url.pathname.endsWith('/onboarding')) {
			if (request.method === 'POST') {
				return handlePostOnboarding(request, env, userUuid);
			} else if (request.method === 'GET') {
				return handleGetOnboarding(env, userUuid);
			}
		} else if (url.pathname.endsWith('/onboarding/delete') && request.method === 'POST') {
			return handleDeleteOnboarding(request, env, userUuid);
		}

		return new Response('Not Found', { status: 404 });
	},
};

async function handlePostOnboarding(request: Request, env: Env, userUuid: string): Promise<Response> {
	const onboardingVideos: OnboardingVideo = {
		home: "https://www.youtube.com/991117e6-7997-4781-823c-2cc9d8caf56a",
		properties: "https://www.youtube.com/991117e6-7997-4781-823c-2cc9d8caf56a",
		property: "https://www.youtube.com/991117e6-7997-4781-823c-2cc9d8caf56a",
		revenues: "https://www.youtube.com/991117e6-7997-4781-823c-2cc9d8caf56a"
	};

	const stmt = env.DB.prepare(
		'INSERT OR REPLACE INTO onboarding_users (user_uuid, onboarding_videos) VALUES (?, ?)'
	);

	await stmt.bind(userUuid, JSON.stringify(onboardingVideos)).run();

	return new Response(JSON.stringify({ success: true }), {
		headers: { 'Content-Type': 'application/json' },
	});
}

async function handleGetOnboarding(env: Env, userUuid: string): Promise<Response> {
	const { results } = await env.DB.prepare(
		'SELECT onboarding_videos FROM onboarding_users WHERE user_uuid = ?'
	)
		.bind(userUuid)
		.all();

	if (results.length === 0) {
		return new Response('User not found', { status: 404 });
	}

	// @ts-ignore
	const onboardingVideos = JSON.parse(results[0].onboarding_videos);

	return new Response(JSON.stringify(onboardingVideos), {
		headers: { 'Content-Type': 'application/json' },
	});
}

async function handleDeleteOnboarding(request: Request, env: Env, userUuid: string): Promise<Response> {
	
	const { key } : { key: string } = await request.json();

	const { results } = await env.DB.prepare(
		'SELECT onboarding_videos FROM onboarding_users WHERE user_uuid = ?'
	)
		.bind(userUuid)
		.all();

	if (results.length === 0) {
		return new Response('User not found', { status: 404 });
	}

	// @ts-ignore
	const onboardingVideos = JSON.parse(results[0].onboarding_videos) as OnboardingVideo;

	if (key in onboardingVideos) {
		delete onboardingVideos[key];
	}

	if (Object.keys(onboardingVideos).length === 0) {
		await env.DB.prepare('DELETE FROM onboarding_users WHERE user_uuid = ?')
			.bind(userUuid)
			.run();
		return new Response(JSON.stringify({ success: true, message: 'User deleted' }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} else {
		await env.DB.prepare('UPDATE onboarding_users SET onboarding_videos = ? WHERE user_uuid = ?')
			.bind(JSON.stringify(onboardingVideos), userUuid)
			.run();
		return new Response(JSON.stringify({ success: true, message: 'Key deleted' }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}
}