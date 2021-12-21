import { Component, h } from 'preact';
import { Router } from 'preact-router';
import Home from "./Home";
import Room from "./Room";
import Storage from "./storage";
import BackendService from "./backend.service";
import Redirect from "./Redirect";

const App = () => (
	<Router>
		<Room path="/room/:id" api={new BackendService()} storage={new Storage()} />
		<Home path="/start" createRoom={createRoom} />
		<Redirect default to="/start" />
	</Router>
)

async function createRoom() {
	const response = await fetch("https://bhn-planning-poker.herokuapp.com/room", { method: "POST" });
	const { roomId } = await response.json();
	return roomId;
}

export default App;
