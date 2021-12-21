import { Component, h } from 'preact';

export default function Pack({ availablePacks, currentPack, handlePackChange, user, handleVoteCast }) {
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