<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import Input from '$components/ui/input/Input.svelte';
	import Checkbox from '$components/ui/checkbox/Checkbox.svelte';

	// Animation
	const [send, receive] = crossfade({
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});

	// Fetch todos from the database
	export let data;
	let todos: { completed: boolean; id: number; description: string }[] = data.data;
	let uid = todos.length + 1;

	// CRUD
	function add(input: any) {
		// Add the activity in the database
		const params = new FormData();
		params.append('description', input.value);
		fetch('/api/activity/create', {
			method: 'post',
			body: params
		})
			.then((data) => {
				data.json().then((activity) => {
					console.log('Added activity');
					console.log(activity);

					// Add to the list
					const todo = {
						id: activity.id,
						completed: activity.completed,
						description: activity.description
					};

					todos = [todo, ...todos];
					input.value = '';
				});
			})
			.catch((err) => {
				console.error(err);
			});
	}

	function remove(todo: { completed: boolean; id: number; description: string }) {
		todos = todos.filter((t) => t !== todo);

		// Remove the activity from the database
		const params = new FormData();
		params.append('id', todo.id.toString());
		fetch('/api/activity/delete', {
			method: 'post',
			body: params
		})
			.then((data) => {
				console.log('Removed activity');
			})
			.catch((err) => {
				console.error(err);
			});
	}

	function update(todo: { completed: boolean; id: number; description: string }) {
		// Toggle completed
		todo.completed = !todo.completed;

		// Update the activity in the database
		const params = new FormData();
		params.append('id', todo.id.toString());
		params.append('description', todo.description.toString());
		params.append('completed', todo.completed.toString());
		fetch('/api/activity/update', {
			method: 'post',
			body: params
		})
			.then((data) => {
				console.log('Updated activity');
			})
			.catch((err) => {
				console.error(err);
			});
	}
</script>

<!-- HTML -->
<div class="max-w-5xl m-auto">
	<h1 class="scroll-m-20 text-4xl text-center font-bold tracking-tight lg:text-5xl mb-8">Vercel Test</h1>

	<Input
		placeholder="Add an activity to do"
		name="description"
		on:keyup={(event) => {
			if (event.key === 'Enter') add(event.target);
		}}
	/>

	<div class="grid grid-cols-2 gap-x-6 mt-5">
		<div class="left">
			<h2
				class="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
			>
				Todo
			</h2>
			{#each todos.filter((t) => !t.completed) as todo (todo.id)}
				<label
					in:receive={{ key: todo.id }}
					out:send={{ key: todo.id }}
					animate:flip
					class="shadow-sm"
				>
					<Checkbox bind:checked={todo.completed} on:click={() => update(todo)} />
					{todo.description}
					<button on:click={() => remove(todo)}>x</button>
				</label>
			{/each}
		</div>

		<div class="right">
			<h2
				class="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
			>
				Done
			</h2>
			{#each todos.filter((t) => t.completed) as todo (todo.id)}
				<label
					in:receive={{ key: todo.id }}
					out:send={{ key: todo.id }}
					animate:flip
					class="shadow-sm"
				>
					<input type="checkbox" bind:checked={todo.completed} on:click={() => update(todo)} />
					{todo.description}
					<button on:click={() => remove(todo)}>x</button>
				</label>
			{/each}
		</div>
	</div>
</div>

<!-- STYLE -->
<style>
	:global(body) {
		padding: 30px 10%;
	}

	.left,
	.right {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	label {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.5em 0.8em;
		border-radius: var(--radius);

		background-color: hsl(var(--accent));
	}

	.right label {
		background-color: hsl(var(--muted-foreground));
		color: hsl(var(--muted));
		/* background-color: hsl(var(--muted-foreground)); */
	}

	button {
		position: absolute;
		right: 0.5em;

		box-sizing: border-box;
		line-height: 1;
		background-color: transparent;
		border: none;
		opacity: 0;
		transition: opacity 0.2s;

		font-size: 1.2rem;
		font-family: inherit;
		font-weight: bold;
		color: hsl(var(--destructive));
	}

	label:hover button {
		opacity: 1;
	}
</style>
