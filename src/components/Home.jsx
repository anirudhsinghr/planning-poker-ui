import { Component, h } from 'preact';
import { useState } from "preact/hooks";
import Redirect from "./Redirect";

export default function Home({ createRoom }) {
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