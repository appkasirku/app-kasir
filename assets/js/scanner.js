import { Modal } from './modal.js';
import { Transaksi } from './transaction.js';

let scanner = null;
let sudahScan = false;
let flashOn = false;
let cameraTrack = null;

const modal = document.querySelector("#modalScanner");
const reader = document.querySelector("#reader");
const focusDot = document.querySelector("#focusDot");

// fungsi buka scanner
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
      	Transaksi.pilihProduk(decoded, 'addpro', '1');
      } else if (rule === "produk") {
      	const inputFormNama = document.querySelector("#inputFormNama");
      	const inputFormKode = document.querySelector("#inputFormKode");
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

// fungsi stop scanner
function stopScanner() {
  if (!scanner) return;
  scanner.stop().then(() => {
    try {
      const stream = reader.srcObject;
      if (stream) stream.getTracks().forEach(t => t.stop());
      scanner = null;
      sudahScan = false;
      flashOn = false;
      cameraTrack = null;
    } catch {}
    modal.style.display = "none";
    document.querySelector(".scan-line")?.classList.remove("show");
  });
}

// fungsi on/off flash scanner
async function toggleFlassScanner() {
  if (!cameraTrack) {
    return Modal.modalInfo({
      body: 'Flash tidak tersedia!',
      btn: { batal: { text: 'Tutup' } }
    });
  }
  try {
    flashOn = !flashOn;
    await cameraTrack.applyConstraints({
      advanced: [{ torch: flashOn }]
    });
    document.querySelector("#btnFlash").style.boxShadow =
      flashOn ? "0 0 0 2px yellow" : "0 0 0 1px #fff";
  } catch (e) {
    Modal.modalInfo({
    	body: 'Flash tidak didukung di perangkat ini.',
    	btn: { batal: { text: 'Tutup' } }
    });
  }
}

// fungsi scan dari file
function scannerFile() {
  const inputFile = document.querySelector("#inputFile");
  inputFile.click();
  inputFile?.addEventListener("change", () => {
    if (inputFile.files.length === 0) return;
    const file = inputFile.files[0];
    
    scanner.stop().then(() => {
    	scanner.scanFile(file, true)
  	    .then(decoded => {
  	      Transaksi.pilihProduk(decoded, 'addpro', '1');
  	      modal.style.display = "none";
  	    })
  	    .catch(err => {
  	    	Modal.modalInfo({
  	    		body: 'Tidak bisa membaca barcode!',
  	    		btn: { batal: { text: 'Tutup' } }
  	    	});
  	    });
    });
  });
}

export const Scanner = {
	openScanner,
	stopScanner,
	scannerFile,
	toggleFlassScanner
};