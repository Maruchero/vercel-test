import prisma from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
	// Get data
	const data = await request.formData();
	const description = data.get('description') as string;
	const completed = false; // By default when you create an activity it will be not completed.

	// Check for errors
	if (!description) throw error(400, "Missing parameter: 'description'.");

	// Create the activity
	const promise = new Promise<Response>((resolve, reject) => {
		prisma.activity
			.create({
				data: {
					description,
					completed
				}
			})
			.then((data) => {
				resolve(new Response(JSON.stringify(data), { status: 201 }));
			})
			.catch((err) => {
				console.error(err);
				reject(new Response('Unable to create activity. Try again', { status: 500 }));
			});
	});
	return promise;
};
