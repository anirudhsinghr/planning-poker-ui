import { Component, h } from 'preact';

export default function VoterInfo({voters, reveal, userId}) {
	if (!reveal) {
		return voters.map(v => <button class={"button m-1 " + (v.id == userId ? "is-success" : "is-info")}>{ v.vote == null ? '-' : 'X' }</button>);
	}
	return (
		<div>
			{voters.map(v => <button class={"button m-1 " + (v.id == userId ? "is-success" : "is-info")}>{ v.vote == null ? '0' : v.vote }</button>)}
		</div>
	)	
};