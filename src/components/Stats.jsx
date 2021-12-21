import { Component, h } from 'preact';

export default function Stats({data}) {
	const filteredData = data.filter(num => !isNaN(num))
	const sum = filteredData.reduce((previous, current) => previous + current, 0);
	const mean = sum / filteredData.length;

	const corrected = filteredData.map(n => Math.pow(n - mean, 2))
	const correctedSum = corrected.reduce((previous, current) => previous + current, 0);
	const stddev = Math.sqrt(correctedSum / corrected.length)

	return (
		<div>
			<h3>Mean - {mean}</h3>
			<h3>Standard Deviation - {stddev}</h3>
		</div>
	);
}