import { Modal } from './modal.js';
import { Transaksi } from './transaction.js';

let scanner = null;
let sudahScan = false;
let flashOn = false;
let cameraTrack = null;

const modal = document.getElementById("modalScanner");
const reader = document.getElementById("reader");
const focusDot = document.getElementById("focusDot");

function openScanner(rule) {
  modal.style.display = "flex";
  sudahScan = false;
  
  if (!scanner) scanner = new Html5Qrcode("reader");

  scanner.start(
    { facingMode: "environment" },
    {
      fps: 12,
      qrbox: { width: 280, height: 220 },
      disableFlip: false
    },
    decoded => {
      if (sudahScan) return;
      sudahScan = true;
      if (rule === "transaksi") {
      	Transaksi.pilihProduk(decoded, 'addpro');
      } else if (rule === "produk") {
      	const inputFormNama = document.getElementById("inputFormNama");
      	const inputFormKode = document.getElementById("inputFormKode");
      	inputFormNama.focus();
      	inputFormKode.value = decoded;
      }
      stopScanner();
    },
    () => {
      // Auto retry: fokus berubah → dot berkedip
    	document.querySelector(".scan-line").classList.add("show");
      focusDot.style.background = "#00ff00";
      setTimeout(() => (focusDot.style.background = "#66ff66"), 200);
    }
  ).then(() => {
    // Ambil kamera track untuk flash
    const videoElem = reader.querySelector("video");
    if (videoElem && videoElem.srcObject) {
      cameraTrack = videoElem.srcObject.getVideoTracks()[0];
    }
  });
}

function stopScanner() {
  if (!scanner) return;

  scanner.stop().then(() => {
    try {
      const stream = reader.srcObject;
      if (stream) stream.getTracks().forEach(t => t.stop());
    } catch {}

    modal.style.display = "none";
    document.querySelector(".scan-line").classList.remove("show");
  });
}

/* =============== FLASH CONTROL ================= */
document.getElementById("btnFlash")?.addEventListener("click", async () => {
  if (!cameraTrack) return alert("Flash tidak tersedia!");

  try {
    flashOn = !flashOn;
    await cameraTrack.applyConstraints({
      advanced: [{ torch: flashOn }]
    });

    document.getElementById("btnFlash").style.boxShadow =
      flashOn ? "0 0 0 2px yellow" : "0 0 0 1px #fff";
  } catch (e) {
    Modal.modalInfo({
    	body: 'Flash tidak didukung di perangkat ini.',
    	btn: { close: { text: 'Tutup' } }
    });
  }
});

/* =============== SCAN DARI FILE =============== */
const inputFile = document.getElementById("inputFile");
document.getElementById("btnScanFile")?.addEventListener("click", () => {
  inputFile.click();
});

inputFile?.addEventListener("change", () => {
  if (inputFile.files.length === 0) return;
  const file = inputFile.files[0];
  
  scanner.stop().then(() => {
  	scanner.scanFile(file, true)
	    .then(decoded => {
	      Transaksi.pilihProduk(decoded, 'addpro');
	      modal.style.display = "none";
	    })
	    .catch(err => {
	    	Modal.modalInfo({
	    		body: 'Tidak bisa membaca barcode!',
	    		btn: { close: { text: 'Tutup' } }
	    	});
	    });
  });
});

export const Scanner = {
	openScanner,
	stopScanner
};