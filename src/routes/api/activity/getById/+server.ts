import prisma from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	// Get data
	const data = await request.formData();
	const id = parseInt(data.get('id') as string);

	// Check for errors
	if (!id) throw error(400, "Missing parameter: 'id'.");

	// Get a single activity
	const promise = new Promise<Response>((resolve, reject) => {
		prisma.activity
			.findUnique({
				where: {
					id: id
				}
			})
			.then((data) => {
				resolve(new Response(JSON.stringify(data), { status: 201 }));
			})
			.catch((err) => {
				console.error(err);
				reject(new Response('Activity fetching failed', { status: 500 }));
			});
	});
	return promise;
};
