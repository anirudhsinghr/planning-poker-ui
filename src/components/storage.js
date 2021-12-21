export default class Storage {
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