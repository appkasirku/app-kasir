// untuk proses transaksi
function playBell() {
	const bell = document.querySelector("#soundBeep");
  if (!bell) return;
	bell.currentTime = 0;
	bell.play();
}

// untuk proses save
function playSave() {
	const bell = document.querySelector("#soundSave");
  if (!bell) return;
	bell.currentTime = 0;
	bell.play();
}

// untuk proses update
function playUpdate() {
	const bell = document.querySelector("#soundUpdate");
  if (!bell) return;
	bell.currentTime = 0;
	bell.play();
}

// untuk proses delete
function playDelete() {
	const bell = document.querySelector("#soundDelete");
  if (!bell) return;
	bell.currentTime = 0;
	bell.play();
}

export const Sound = {
	playBell,
	playSave,
	playUpdate,
	playDelete
};