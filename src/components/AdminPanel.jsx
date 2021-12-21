import { Component, h } from 'preact';

export default function AdminPanel({ onReset, onReveal }) {
	return (
		<div class="mt-3">
			<button onClick={onReset} class="button is-danger mr-4">Reset</button>
			<button onClick={onReveal} class="button is-warning ml-4">Reveal</button>
		</div>
	);
}