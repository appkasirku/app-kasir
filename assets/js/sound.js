const soundBeep = document.querySelector("#soundBeep");
const soundSave = document.querySelector("#soundSave");
const soundUpdate = document.querySelector("#soundUpdate");
const soundDelete = document.querySelector("#soundDelete");
const soundProcess = document.querySelector("#soundProcess");

// fungsi suara tambah transaksi
function playBell() {
  if (!soundBeep) return;
	soundBeep.currentTime = 0;
	soundBeep.volume = 0.5;
	soundBeep.play();
}

// fungsi suara simpan data
function playSave() {
  if (!soundSave) return;
	soundSave.currentTime = 0;
	soundSave.volume = 1.0;
	soundSave.play();
}

// suara update data
function playUpdate() {
  if (!soundUpdate) return;
	soundUpdate.currentTime = 0;
	soundUpdate.volume = 1.0;
	soundUpdate.play();
}

// fungsi suara hapus data
function playDelete() {
  if (!soundDelete) return;
	soundDelete.currentTime = 0;
	soundDelete.volume = 1.0;
	soundDelete.play();
}

// fungsi suara proses berjalan
function playProcess() {
  if (!soundProcess) return;
  soundProcess.pause();
  soundProcess.currentTime =  0;
  soundProcess.loop = true;
  soundProcess.volume = 0.75;
  soundProcess.play();
}

// fungsi stop suara proses berjalan
function stopProcess() {
  if (!soundProcess) return;
  soundProcess.loop = false;
  soundProcess.pause();
  soundProcess.currentTime = 0;
}

export const Sound = {
	playBell,
	playSave,
	playUpdate,
	playDelete,
	playProcess,
	stopProcess
};