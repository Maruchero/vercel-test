import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	// Get all activities
	const res = await fetch('/api/activity/getAll', { method: 'post' });
	const data = await res.json();
	return { data };
}) satisfies PageLoad;
