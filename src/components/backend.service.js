import { io } from "socket.io-client";

export default class BackendService {
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