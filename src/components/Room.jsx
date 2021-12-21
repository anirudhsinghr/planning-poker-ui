import { Component, h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Pack from "./Pack";
import Stats from "./Stats";
import VoterInfo from "./VoterInfo";
import AdminPanel from "./AdminPanel";

export default function Room({ id, api, storage }) {
	const [error, setError] = useState(null);
	const [state, setState] = useState(null);
	const [user, setUser] = useState(null);

	const handleRoomNotFound = () => setError("No Room With Given Id Found");
	const handleStateChange = (newState) => setState(newState);
	const handleRoomJoin = (data) => { setUser(data); storage.save(data); }
	const handlePackChange = (e) => api.changePack({...storage.getData(id), packName: e.target.value});
	const handleVoteCast = (roomId, voterId, vote) => api.castVote({ roomId, voterId, vote });
	const handleReset = (roomId, voterId) => api.reset({ roomId, voterId });
	const handleReveal = (roomId, voterId) => api.reveal({ roomId, voterId });

	useEffect(() => {
		const handlers = {
			'room.not_found': handleRoomNotFound,
			'state.changed': handleStateChange,
			'joined': handleRoomJoin,
		};

		const voterId = storage.getVoterId(id);

		api.subscribe(id, voterId, handlers);
		
		return () => api.unsubscribe();
	}, []);

	if (error) return <h1 style={{'color': 'red'}}>{error}</h1>
	if (!state) return <h1>Loading</h1>;

	return (
		<div className="columns is-centered mt-6">
			<div class="box column is-half has-text-centered p-6">
				<h2 class="title">Room {id}</h2>
				<Pack 
					availablePacks={state.availablePacks} 
					currentPack={state.pack} 
					user={user}
					handlePackChange={handlePackChange} 
					handleVoteCast={handleVoteCast}/>
				<VoterInfo voters={state.voters} reveal={state.reveal} userId={user.voterId} />


				<div>
					{ state.reveal && <Stats data={state.voters.map(v => parseInt(v.vote))} /> }
				</div>
				{ 
					user.isAdmin &&
					<AdminPanel 
						onReset={() => handleReset(user.roomId, user.voterId)}
						onReveal={() => handleReveal(user.roomId, user.voterId)} 
					/>
				}
			</div>
		</div>
	);
}