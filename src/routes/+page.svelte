<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

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
<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Vercel Test</h1>

<div class="board">
	<input
		class="new-todo"
		placeholder="what needs to be done?"
		name="description"
		on:keyup={(event) => {
			if (event.key === 'Enter') add(event.target);
		}}
	/>

	<div class="left">
		<h2>Todo</h2>
		{#each todos.filter((t) => !t.completed) as todo (todo.id)}
			<label in:receive={{ key: todo.id }} out:send={{ key: todo.id }} animate:flip>
				<input type="checkbox" bind:checked={todo.completed} on:click={() => update(todo)} />
				{todo.description}
				<button on:click={() => remove(todo)}>x</button>
			</label>
		{/each}
	</div>

	<div class="right">
		<h2>Done</h2>
		{#each todos.filter((t) => t.completed) as todo (todo.id)}
			<label in:receive={{ key: todo.id }} out:send={{ key: todo.id }} animate:flip>
				<input type="checkbox" bind:checked={todo.completed} on:click={() => update(todo)} />
				{todo.description}
				<button on:click={() => remove(todo)}>x</button>
			</label>
		{/each}
	</div>
</div>

<!-- STYLE -->
<style>
	.new-todo {
		font-size: 1.4em;
		width: 100%;
		margin: 2em 0 1em 0;
	}

	.board {
		max-width: 36em;
		margin: 0 auto;
	}

	.left,
	.right {
		float: left;
		width: 50%;
		padding: 0 1em 0 0;
		box-sizing: border-box;
	}

	h2 {
		font-size: 2em;
		font-weight: 200;
		user-select: none;
	}

	label {
		top: 0;
		left: 0;
		display: block;
		font-size: 1em;
		line-height: 1;
		padding: 0.5em;
		margin: 0 auto 0.5em auto;
		border-radius: 2px;
		background-color: #eee;
		user-select: none;
	}

	input {
		margin: 0;
	}

	.right label {
		background-color: rgb(180, 240, 100);
	}

	button {
		float: right;
		height: 1em;
		box-sizing: border-box;
		padding: 0 0.5em;
		line-height: 1;
		background-color: transparent;
		border: none;
		color: rgb(170, 30, 30);
		opacity: 0;
		transition: opacity 0.2s;
	}

	label:hover button {
		opacity: 1;
	}
</style>
