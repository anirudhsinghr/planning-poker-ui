import { Component, h } from 'preact';
import { Router, route } from 'preact-router';
import { useState, useEffect } from 'preact/hooks';
import { io } from "socket.io-client";

const App = () => (
	<Router>
		<Room path="/room/:id" api={new BackendService()} storage={new Storage()} />
		<Home path="/start" createRoom={createRoom} />
		<Redirect default to="/start" />
	</Router>
)

function Home({ createRoom }) {
	const [roomId, setRoomId] = useState(null);
	const [data, setData] = useState(null);
	
	async function handleCreateRoom() {
		const roomId = await createRoom();
		setRoomId(roomId);
	}

	if (roomId) return <Redirect to={`/room/${roomId}`} />

	return (
		<div class="container column is-flex is-justify-content-center is-align-content-center is-fullheight">
			<article class="panel is-primary">
  			<p class="panel-heading">Planning Poker</p>
				<div class="panel-block">
					<button class="button is-centered is-primary is-fullwidth" onClick={handleCreateRoom}>Create Room</button>
					<hr />
				</div>
				<div className="panel-block">
					<input value={data} onInput={(e) => setData(e.target.value)} class="input is-link" type="text" name="room" id="room" placeholder='Enter room number' />
					<button class="button is-info ml-1" onClick={() => setRoomId(data)}>Join Room</button>
				</div>
			</article> 
		</div>
	);
}

class Storage {
	save({ roomId, voterId, isAdmin }) {
		const record = { roomId, voterId, isAdmin };
		const data = JSON.parse(localStorage.getItem("data")) || [];

		data.push(record);

		localStorage.setItem("data", JSON.stringify(data));
	}

	getVoterId(roomId) {
		const data = JSON.parse(localStorage.getItem("data"));
		if (!data) return null;

		const room = data.find(x => x.roomId === roomId);

		return room ? room['voterId'] : null;
	}

	getData(roomId) {
		const data = JSON.parse(localStorage.getItem("data"));
		if (!data) return null;

		return data.find(x => x.roomId === roomId);
	}
}

const Room = function({ id, api, storage }) {
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

	)
}

function AdminPanel({ onReset, onReveal }) {
	return (
		<div class="mt-3">
			<button onClick={onReset} class="button is-danger mr-4">Reset</button>
			<button onClick={onReveal} class="button is-warning ml-4">Reveal</button>
		</div>
	);
}

const Pack = ({ availablePacks, currentPack, handlePackChange, user, handleVoteCast }) => {
	return (
		<div class="level">
			<div id="pack" class="level-item has-text-centered">
				{ currentPack.data.map(
					(element, index) => 
						<button 
							class="button is-primary m-1"
							onClick={() => handleVoteCast(user.roomId, user.voterId, element)} 
							key={index}>
								{element}
						</button>
					)}
			</div>
			<div class="level-right">
				{ user.isAdmin ? 
					<div class="level-item select">
						<select name="packName" id="packName" onChange={handlePackChange}>
							{availablePacks.map(
								(pack) => <option value={pack} selected={pack === currentPack.name}>{pack}</option>
							)}
						</select>
					</div>
				: null}
			</div>
		</div>
	);
}

const VoterInfo = ({voters, reveal, userId}) => {
	if (!reveal) {
		return voters.map(v => <button class={"button m-1 " + (v.id == userId ? "is-success" : "is-info")}>{ v.vote == null ? '-' : 'X' }</button>);
	}
	return (
		<div>
			{voters.map(v => <button class={"button m-1 " + (v.id == userId ? "is-success" : "is-info")}>{ v.vote == null ? '0' : v.vote }</button>)}
		</div>
	)	
};

function Stats({data}) {
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

class Redirect extends Component {
	componentWillMount() {
    route(this.props.to, true);
  }

  render() {
    return null;
  }
}

class BackendService {
	constructor() {
		this.socket = null;
		this.intervalHandle = null;
	}

	subscribe(roomId, voterId, handlers) {
		let query = { roomId };
		if (voterId) query = {...query, voterId};
		this.socket = io("https://bhn-planning-poker.herokuapp.com", {query: query });
		this.intervalHandle = setInterval(() => this.socket.emit("heartbeat"), 15 * 1000);

		for (const event in handlers) {
			this.socket.on(event, handlers[event])
		}
	}

	changePack({roomId, voterId, packName}) {
		this.socket.emit("pack.change", {roomId, voterId, packName})
	}

	castVote({ roomId, voterId, vote }) {
		this.socket.emit("vote.cast", { roomId, voterId, vote });
	}
	
	reset({ roomId, voterId }) {
		this.socket.emit("reset", { roomId, voterId });
	}

	reveal({ roomId, voterId }) {
		this.socket.emit("reveal", { roomId, voterId });
	}

	unsubscribe() {
		this.socket.close();
		clearInterval(this.intervalHandle);
	}
}

async function createRoom() {
	const response = await fetch("https://bhn-planning-poker.herokuapp.com/room", { method: "POST" });
	const { roomId } = await response.json();
	return roomId;
}

export default App;
