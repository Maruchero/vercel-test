import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (): Promise<Response> => {
	// Get all activities
	const promise = new Promise<Response>((resolve, reject) => {
		prisma.activity
			.findMany()
			.then((data: object[]) => {
				resolve(new Response(JSON.stringify(data), { status: 201 }));
			})
			.catch((err) => {
				console.error(err);
				reject(new Response('Activities fetching failed.', { status: 500 }));
			});
	});
	return promise;
};
