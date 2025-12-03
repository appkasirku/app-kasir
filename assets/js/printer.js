/*
import { Modal } from './modal.js';

/// SCAN SEMUA SERVICE DAN CHARACTERISTIC ///
let printerDevice = null;
let printerCharacteristic = null;
let server;
let service;

const SERVICE_UUID = 0xFFE0;
const CHARACTERISTIC_UUID = 0xFFE1;

async function scanBluetooth() {
	try {
		printerDevice = await navigator.bluetooth.requestDevice({
			acceptAllDevices: true,
			optionalServices: [
				0xff00, 0xff01, 0xff02, 
				'0000ffe0-0000-1000-8000-00805f9b34fb',
				'0000ffe1-0000-1000-8000-00805f9b34fb',
				'000018f0-0000-1000-8000-00805f9b34fb',
				'00002af1-0000-1000-8000-00805f9b34fb',
				'0000ae30-0000-1000-8000-00805f9b34fb',
				'0000ae01-0000-1000-8000-00805f9b34fb'
			]
		});
		const server = await printerDevice.gatt.connect();
		const services = await server.getPrimaryServices();
		for (const service of services) {
      const chars = await service.getCharacteristics();
      for (const c of chars) {
        if (c.properties.writeWithoutResponse || c.properties.write) {
          printerCharacteristic = c; 
          break;
        }
      }
    }
    if (!printerCharacteristic) {
      return Modal.modalInfo({
      	body: 'Tidak ditemukan characteristic untuk mengirim data!',
      	btn: { close: { text: 'Tutup' } }
      });
    }
    const status = document.querySelector("#status");
    status.style.color = "blue";
    status.textContent =  `Status: Printer ${printerDevice.name} terhubung`;
    setTimeout(() => {
      document.querySelector(".connection").classList.remove("show");
    }, 1000);
  } catch (err) {
  	console.log("Error:", err);
  }
}

/// PRINT STRUK ///
async function printLine(text, align = 0) {
	if (!printerCharacteristic) {
		return Modal.modalInfo({
			body: 'Printer belum terhubung!',
			btn: { close: { text: 'Tutup' } }
		});
	}
	let esc_align = new Uint8Array([0x1B, 0x61, align]);
	let bytes = new TextEncoder().encode(text + "\n");

  await printerCharacteristic.writeValue(esc_align);
  await printerCharacteristic.writeValue(bytes);
}

function lineLR(left, right, width = 32) {
  let space = width - left.length - right.length;
  if (space < 1) space = 1;
  return left + " ".repeat(space) + right;
}

async function printStyled(text, align = 0, style = 0x00) {
  if (!printerCharacteristic) return;

  let esc_align = new Uint8Array([0x1B, 0x61, align]);
  let esc_style = new Uint8Array([0x1B, 0x21, style]); // style font
  let bytes = new TextEncoder().encode(text + "\n");

  await printerCharacteristic.writeValue(esc_align);
  await printerCharacteristic.writeValue(esc_style);
  await printerCharacteristic.writeValue(bytes);

  // Kembalikan ke normal setelah cetak
  await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x21, 0x00]));
}

function toBytes(text) {
  return new TextEncoder("utf-8").encode(text);
}

async function writeChunked(printerCharacteristic, data, chunkSize = 500) {
	for (let i = 0; i < data.length; i += chunkSize) {
		const chunk = data.slice(i, i + chunkSize);
		await printerCharacteristic.writeValue(chunk);
  }
}

// fungsi auto rekonek bluetooth printer
// ========= CONNECT TANPA POPUP (REMEMBERED DEVICE) ==========
async function reconnectIfRemembered() {
  const devices = await navigator.bluetooth.getDevices();

  if (devices.length === 0) return; // belum pernah connect

  printerDevice = devices[0];
  printerDevice.addEventListener("gattserverdisconnected", autoReconnect);

  try {
    await connect();
    Modal.modalInfo({
    	body: 'Auto reconnected to remembered device!',
    	btn: { close: { text: 'Tutup' } }
    });
  } catch (e) {
    Modal.modalInfo({
    	body: 'Failed reconnect, waiting printer...',
    	btn: { close: { text: 'Tutup' } }
    });
    autoReconnect();
  }
}

// ========= PROSES CONNECT GATT ==========
async function connect() {
  server = await printerDevice.gatt.connect();
  service = await server.getPrimaryService(SERVICE_UUID);
  printerCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
}

// ========= AUTO RECONNECT JIKA PUTUS ==========
async function autoReconnect() {
  Modal.modalInfo({
  	body: 'Printer disconnected → trying reconnect...',
  	btn: { close: { text: 'Tutup' } }
  });

  while (printerDevice && !printerDevice.gatt.connected) {
    try {
      await connect();
      Modal.modalInfo({
      	body: 'Reconnected!',
      	btn: { close: { text: 'Tutup' } }
      });
      break;
    } catch (e) {
      Modal.modalInfo({
      	body: 'Retry in 2s...',
      	btn: { close: { text: 'Tutup' } }
      });
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

// fungsi cek koneksi printer
function cekKoneksiPrinter() {
  if (!printerCharacteristic) {
    document.querySelector(".connection").classList.add("show");
    Modal.tutupModalInfo();
    return false;
  }
  return true;
}

function tutupModalKoneksi() {
	document.querySelector(".connection").classList.remove("show");
}

export const Printer = {
	scanBluetooth,
	cekKoneksiPrinter,
	tutupModalKoneksi,
	printStyled,
	printLine,
	lineLR,
	reconnectIfRemembered
};
*/

/*
import { Modal } from './modal.js';

/// =======================
/// VARIABLE UTAMA
/// =======================
let printerDevice = null;
let printerCharacteristic = null;
let server;
let service;

const SERVICE_UUID = 0xFFE0;
const CHARACTERISTIC_UUID = 0xFFE1;


/// =======================
/// SCAN BLUETOOTH
/// =======================
async function scanBluetooth() {
  try {
    printerDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        0xff00, 0xff01, 0xff02,
        '0000ffe0-0000-1000-8000-00805f9b34fb',
        '0000ffe1-0000-1000-8000-00805f9b34fb',
        '000018f0-0000-1000-8000-00805f9b34fb',
        '00002af1-0000-1000-8000-00805f9b34fb',
        '0000ae30-0000-1000-8000-00805f9b34fb',
        '0000ae01-0000-1000-8000-00805f9b34fb'
      ]
    });

    server = await printerDevice.gatt.connect();
    const services = await server.getPrimaryServices();

    for (const svc of services) {
      const chars = await svc.getCharacteristics();
      for (const c of chars) {
        if (c.properties.writeWithoutResponse || c.properties.write) {
          printerCharacteristic = c;
          break;
        }
      }
    }

    if (!printerCharacteristic) {
      return Modal.modalInfo({
        body: 'Tidak ditemukan characteristic untuk mengirim data!',
        btn: { close: { text: 'Tutup' } }
      });
    }

    // Update status tampilan
    const status = document.querySelector("#status");
    status.style.color = "blue";
    status.textContent = `Status: Printer ${printerDevice.name} terhubung`;

    // Tutup modal koneksi
    setTimeout(() => {
      document.querySelector(".connection").classList.remove("show");
    }, 500);

    // Tambahan: listener agar auto-reconnect
    printerDevice.addEventListener("gattserverdisconnected", autoReconnect);

  } catch (err) {
    console.log("Error:", err);
  }
}


/// =======================
/// CETAK BARIS BIASA
/// =======================
async function printLine(text, align = 0) {
  if (!printerCharacteristic) {
    return Modal.modalInfo({
      body: 'Printer belum terhubung!',
      btn: { close: { text: 'Tutup' } }
    });
  }

  const esc_align = new Uint8Array([0x1B, 0x61, align]);
  const bytes = new TextEncoder().encode(text + "\n");

  await printerCharacteristic.writeValue(esc_align);
  await printerCharacteristic.writeValue(bytes);
}


/// =======================
/// CETAK DENGAN STYLE
/// =======================
async function printStyled(text, align = 0, style = 0x00) {
  if (!printerCharacteristic) return;

  const esc_align = new Uint8Array([0x1B, 0x61, align]);
  const esc_style = new Uint8Array([0x1B, 0x21, style]);
  const bytes = new TextEncoder().encode(text + "\n");

  await printerCharacteristic.writeValue(esc_align);
  await printerCharacteristic.writeValue(esc_style);
  await printerCharacteristic.writeValue(bytes);

  // Kembalikan style normal
  await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x21, 0x00]));
}


/// =======================
/// ALIGN L-R
/// =======================
function lineLR(left, right, width = 32) {
  let space = width - left.length - right.length;
  if (space < 1) space = 1;
  return left + " ".repeat(space) + right;
}


/// =======================
/// AUTO RECONNECT
/// =======================
async function reconnectIfRemembered() {
  const devices = await navigator.bluetooth.getDevices();
  if (devices.length === 0) return;

  printerDevice = devices[0];
  printerDevice.addEventListener("gattserverdisconnected", autoReconnect);

  try {
    await connect();
    Modal.modalInfo({
      body: 'Auto reconnected to remembered device!',
      btn: { close: { text: 'Tutup' } }
    });
  } catch {
    Modal.modalInfo({
      body: 'Failed reconnect, waiting printer...',
      btn: { close: { text: 'Tutup' } }
    });
    autoReconnect();
  }
}


/// CONNECT GATT
async function connect() {
  server = await printerDevice.gatt.connect();
  service = await server.getPrimaryService(SERVICE_UUID);
  printerCharacteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
}


/// LOOPING AUTO RECONNECT
async function autoReconnect() {
  Modal.modalInfo({
    body: 'Printer disconnected → trying reconnect...',
    btn: { close: { text: 'Tutup' } }
  });

  while (printerDevice && !printerDevice.gatt.connected) {
    try {
      await connect();
      Modal.modalInfo({
        body: 'Reconnected!',
        btn: { close: { text: 'Tutup' } }
      });
      break;

    } catch {
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}


/// =======================
/// CEK KONEKSI PRINTER
/// =======================
function cekKoneksiPrinter() {
  if (!printerCharacteristic) {
    document.querySelector(".connection").classList.add("show");
     //Modal.tutupModalInfo();
    return false;
  }
  return true;
}


/// TUTUP MODAL KONEKSI
function tutupModalKoneksi() {
  document.querySelector(".connection").classList.remove("show");
}


/// =======================
/// EXPORT OBJECT
/// =======================
export const Printer = {
  scanBluetooth,
  cekKoneksiPrinter,
  tutupModalKoneksi,
  printStyled,
  printLine,
  lineLR,
  reconnectIfRemembered
};
*/

/*
import { Modal } from './modal.js';

/// =======================
/// VARIABLE GLOBAL
/// =======================
let printerDevice = null;
let printerCharacteristic = null;
let server = null;
let service = null;

const SERVICE_UUID = 0xFFE0;
const CHARACTERISTIC_UUID = 0xFFE1;

let isConnecting = false;  // mencegah double connect saat error


/// =======================
/// FUNGSI SCAN & CONNECT
/// =======================
async function scanBluetooth() {
  try {
    if (isConnecting) return;
    isConnecting = true;

    Modal.tutupModalInfo();

    printerDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        0xff00, 0xff01, 0xff02,
        '0000ffe0-0000-1000-8000-00805f9b34fb',
        '0000ffe1-0000-1000-8000-00805f9b34fb',
        '000018f0-0000-1000-8000-00805f9b34fb',
        '00002af1-0000-1000-8000-00805f9b34fb',
        '0000ae30-0000-1000-8000-00805f9b34fb',
        '0000ae01-0000-1000-8000-00805f9b34fb'
      ]
    });

    await connectToGATT(printerDevice);

    // tampilkan status
    const status = document.querySelector("#status");
    status.style.color = "blue";
    status.textContent = `Status: Printer ${printerDevice.name} terhubung`;

    // tutup modal koneksi
    setTimeout(() => {
      document.querySelector(".connection").classList.remove("show");
    }, 300);

    // siapkan auto reconnect
    printerDevice.addEventListener("gattserverdisconnected", autoReconnect);

  } catch (err) {

    // ====== PENANGANAN ERROR ======
    if (err.message.includes("Connection attempt failed")) {
      Modal.modalInfo({
        body: "Tidak bisa terhubung! Pastikan printer hidup & belum dipakai aplikasi lain.",
        btn: { close: { text: "Tutup" } }
      });
    } else if (err.name === "NotFoundError") {
      // user menutup dialog bluetooth → tidak apa-apa
    } else {
      Modal.modalInfo({
        body: `Error: ${err.message}`,
        btn: { close: { text: "Tutup" } }
      });
    }
    // ===============================

  } finally {
    isConnecting = false;
  }
}


/// =======================
/// CONNECT KE GATT SERVICE
/// =======================
async function connectToGATT(device) {

  server = await device.gatt.connect();

  // cari semua service
  const services = await server.getPrimaryServices();

  for (const svc of services) {
    const chars = await svc.getCharacteristics();
    for (const c of chars) {
      if (c.properties.writeWithoutResponse || c.properties.write) {
        printerCharacteristic = c;
        return;
      }
    }
  }

  throw new Error("Tidak ditemukan characteristic untuk menulis data.");
}


/// =======================
/// CETAK BARIS BIASA
/// =======================
async function printLine(text, align = 0) {
  if (!printerCharacteristic) {
    return Modal.modalInfo({
      body: "Printer belum terhubung!",
      btn: { close: { text: "Tutup" } }
    });
  }

  try {
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x61, align]));
    await printerCharacteristic.writeValue(new TextEncoder().encode(text + "\n"));
  } catch (err) {
    Modal.modalInfo({
      body: "Gagal mencetak. Printer terputus!",
      btn: { close: { text: "Tutup" } }
    });
  }
}


/// =======================
/// CETAK STYLE
/// =======================
async function printStyled(text, align = 0, style = 0x00) {
  if (!printerCharacteristic) return;

  try {
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x61, align]));
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x21, style]));
    await printerCharacteristic.writeValue(new TextEncoder().encode(text + "\n"));
    // reset style
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x21, 0x00]));
  } catch (err) {
    Modal.modalInfo({
      body: "Printer terputus saat mencetak!",
      btn: { close: { text: "Tutup" } }
    });
  }
}


/// =======================
/// ALIGN LEFT - RIGHT
/// =======================
function lineLR(left, right, width = 32) {
  let space = width - left.length - right.length;
  if (space < 1) space = 1;
  return left + " ".repeat(space) + right;
}


/// =======================
/// AUTO RECONNECT SYSTEM
/// =======================
async function reconnectIfRemembered() {
  try {
    const devices = await navigator.bluetooth.getDevices();
    if (devices.length === 0) return;

    printerDevice = devices[0];
    printerDevice.addEventListener("gattserverdisconnected", autoReconnect);

    await connectToGATT(printerDevice);

    Modal.modalInfo({
      body: `Auto reconnect → ${printerDevice.name}`,
      btn: { close: { text: "Tutup" } }
    });

  } catch (err) {
    console.log("Auto reconnect gagal:", err.message);
  }
}


async function autoReconnect() {
  if (!printerDevice) return;

  Modal.modalInfo({
    body: "Printer terputus → mencoba reconnect...",
    btn: { close: { text: "OK" } }
  });

  let attempt = 0;

  while (!printerDevice.gatt.connected && attempt < 10) {  
    try {
      attempt++;
      await connectToGATT(printerDevice);

      Modal.modalInfo({
        body: "Berhasil reconnect!",
        btn: { close: { text: "Tutup" } }
      });

      return;

    } catch {
      await new Promise(res => setTimeout(res, 2000));
    }
  }

  Modal.modalInfo({
    body: "Gagal reconnect. Silakan scan ulang.",
    btn: { close: { text: "Tutup" } }
  });
}


/// =======================
/// CEK KONEKSI PRINTER
/// =======================
function cekKoneksiPrinter() {
  if (!printerCharacteristic) {
    document.querySelector(".connection").classList.add("show");
    return false;
  }
  return true;
}


/// TUTUP MODAL KONEKSI
function tutupModalKoneksi() {
  document.querySelector(".connection").classList.remove("show");
}


/// =======================
/// EXPORT
/// =======================
export const Printer = {
  scanBluetooth,
  cekKoneksiPrinter,
  tutupModalKoneksi,
  printLine,
  printStyled,
  lineLR,
  reconnectIfRemembered
};
*/

/*
import { Modal } from './modal.js';

/// =======================
/// VARIABLE GLOBAL
/// =======================
let printerDevice = null;
let printerCharacteristic = null;
let server = null;

let isConnecting = false; // agar tidak double-connect

/// UUID yang paling umum untuk printer ESC/POS Bluetooth
const SERVICE_UUIDS = [
  0xff00, 0xff01, 0xff02,
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '0000ffe1-0000-1000-8000-00805f9b34fb',
  '000018f0-0000-1000-8000-00805f9b34fb',
  '00002af1-0000-1000-8000-00805f9b34fb',
  '0000ae30-0000-1000-8000-00805f9b34fb',
  '0000ae01-0000-1000-8000-00805f9b34fb'
];


/// =======================
/// SCAN BLUETOOTH
/// =======================
async function scanBluetooth() {
  try {
    if (isConnecting) return;
    isConnecting = true;

    Modal.tutupModalInfo();

    printerDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: SERVICE_UUIDS
    });

    await connectToGATT(printerDevice);

    // Update UI
    const status = document.querySelector("#status");
    status.style.color = "blue";
    status.textContent = `Status: Printer ${printerDevice.name} terhubung`;

    // Tutup modal koneksi
    setTimeout(() => {
      document.querySelector(".connection").classList.remove("show");
    }, 300);

    // Tambahkan auto-reconnect listener
    printerDevice.addEventListener("gattserverdisconnected", autoReconnect);

  } catch (err) {

    // ERROR HANDLER
    if (err.message.includes("Connection attempt failed")) {
      Modal.modalInfo({
        body: "Tidak bisa terhubung! Pastikan printer hidup & tidak dipakai aplikasi lain.",
        btn: { close: { text: "Tutup" } }
      });

    } else if (err.name === "NotFoundError") {
      // user menutup dialog bluetooth → aman
    } else {
      Modal.modalInfo({
        body: `Error: ${err.message}`,
        btn: { close: { text: "Tutup" } }
      });
    }

  } finally {
    isConnecting = false;
  }
}


/// =======================
/// CONNECT TO GATT
/// =======================
async function connectToGATT(device) {

  server = await device.gatt.connect();

  // Ambil semua service
  const services = await server.getPrimaryServices();

  for (const svc of services) {
    const chars = await svc.getCharacteristics();

    for (const c of chars) {
      // Printer ESC/POS biasanya write atau writeWithoutResponse
      if (c.properties.writeWithoutResponse || c.properties.write) {
        printerCharacteristic = c;
        return;
      }
    }
  }

  throw new Error("Tidak ada karakteristik untuk menulis data (write).");
}


/// =======================
/// PRINT LINE
/// =======================
async function printLine(text, align = 0) {
  if (!printerCharacteristic) {
    return Modal.modalInfo({
      body: "Printer belum terhubung!",
      btn: { close: { text: "Tutup" } }
    });
  }

  try {
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x61, align]));
    await printerCharacteristic.writeValue(new TextEncoder().encode(text + "\n"));
  } catch (err) {
    Modal.modalInfo({
      body: "Gagal mencetak. Printer terputus!",
      btn: { close: { text: "Tutup" } }
    });
  }
}


/// =======================
/// PRINT DENGAN STYLE
/// =======================
async function printStyled(text, align = 0, style = 0x00) {
  if (!printerCharacteristic) return;

  try {
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x61, align]));
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x21, style]));
    await printerCharacteristic.writeValue(new TextEncoder().encode(text + "\n"));
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x21, 0x00])); // reset
  } catch (err) {
    Modal.modalInfo({
      body: "Printer terputus saat mencetak!",
      btn: { close: { text: "Tutup" } }
    });
  }
}


/// =======================
/// ALIGN LEFT - RIGHT
/// =======================
function lineLR(left, right, width = 32) {
  let space = width - left.length - right.length;
  if (space < 1) space = 1;
  return left + " ".repeat(space) + right;
}


/// =======================
/// AUTO RECONNECT
/// =======================
async function autoReconnect() {

  Modal.modalInfo({
    body: "Printer terputus → mencoba reconnect...",
    btn: { close: { text: "OK" } }
  });

  let attempt = 0;

  while (!printerDevice.gatt.connected && attempt < 10) {

    try {
      attempt++;
      await connectToGATT(printerDevice);

      Modal.modalInfo({
        body: "Berhasil reconnect!",
        btn: { close: { text: "Tutup" } }
      });

      return;

    } catch (err) {
      await new Promise(res => setTimeout(res, 2000));
    }
  }

  Modal.modalInfo({
    body: "Gagal reconnect. Silakan scan ulang.",
    btn: { close: { text: "Tutup" } }
  });
}


/// =======================
/// AUTO RECONNECT KETIKA APP DIBUKA
/// =======================
async function reconnectIfRemembered() {
  try {
    const devices = await navigator.bluetooth.getDevices();
    if (devices.length === 0) return;

    printerDevice = devices[0];
    printerDevice.addEventListener("gattserverdisconnected", autoReconnect);

    await connectToGATT(printerDevice);

    Modal.modalInfo({
      body: `Auto reconnect → ${printerDevice.name}`,
      btn: { close: { text: "Tutup" } }
    });

  } catch (err) {
    console.log("Auto reconnect gagal:", err.message);
  }
}


/// =======================
/// CEK KONEKSI
/// =======================
function cekKoneksiPrinter() {
  if (!printerCharacteristic) {
    document.querySelector(".connection").classList.add("show");
    return false;
  }
  return true;
}


/// =======================
/// TUTUP MODAL KONEKSI
/// =======================
function tutupModalKoneksi() {
  document.querySelector(".connection").classList.remove("show");
}


/// =======================
/// EXPORT
/// =======================
export const Printer = {
  scanBluetooth,
  cekKoneksiPrinter,
  tutupModalKoneksi,
  printLine,
  printStyled,
  lineLR,
  reconnectIfRemembered
};
*/

import { Modal } from './modal.js';

/// =======================
/// VARIABLE GLOBAL
/// =======================
let printerDevice = null;
let printerCharacteristic = null;
let server = null;

let isConnecting = false;
let connectTimeout = null;

const CONNECT_TIMEOUT_MS = 8000;     // timeout koneksi awal
const RECONNECT_DELAY_MS = 3000;     // jeda reconnect
const MAX_RECONNECT_ATTEMPT = 10;    // jumlah percobaan reconnect


/// =======================
/// FUNGSI UTAMA: SCAN PRINTER
/// =======================
async function scanBluetooth() {
  try {
    if (isConnecting) return;
    isConnecting = true;

    //Modal.tutupModalInfo();

    printerDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        0xff00, 0xff01, 0xff02,
        '0000ffe0-0000-1000-8000-00805f9b34fb',
        '0000ffe1-0000-1000-8000-00805f9b34fb',
        '000018f0-0000-1000-8000-00805f9b34fb',
        '00002af1-0000-1000-8000-00805f9b34fb',
        '0000ae30-0000-1000-8000-00805f9b34fb',
        '0000ae01-0000-1000-8000-00805f9b34fb'
      ]
    });
    
    localStorage.setItem("printerName", printerDevice.name);

    await connectWithTimeout(printerDevice, CONNECT_TIMEOUT_MS);

    tampilkanStatusBerhasil();

    // modal koneksi ditutup otomatis
    setTimeout(() => {
      //document.querySelector(".connection").classList.remove("show");
      tutupModalKoneksi();
    }, 200);

    // aktifkan auto reconnect
    printerDevice.addEventListener("gattserverdisconnected", autoReconnect);

  } catch (err) {

    Modal.tutupModalInfo();
    // ===============================
    // HANDLE ERROR
    // ===============================
    if (err.name === "NotFoundError") {
      // user menutup dialog bluetooth → tidak apa-apa
    } else if (err.message.includes("timeout")) {
      Modal.tutupModalInfo();
      Modal.modalInfo({
        body: "Waktu koneksi habis! Printer tidak merespons.",
        btn: { close: { text: "Tutup" } }
      });
    } else if (err.message.includes("Connection attempt failed")) {
      Modal.tutupModalInfo();
      Modal.modalInfo({
        body: "Tidak bisa terhubung! Matikan dan hidupkan ulang printer.",
        btn: { close: { text: "Tutup" } }
      });
    } else {
      Modal.tutupModalInfo();
      Modal.modalInfo({
        body: "Error: " + err.message,
        btn: { close: { text: "Tutup" } }
      });
    }

  } finally {
    isConnecting = false;
    clearTimeout(connectTimeout);
  }
}


/// =======================
/// FUNGSI TIMEOUT KHUSUS
/// =======================
async function connectWithTimeout(device, timeout) {
  return new Promise((resolve, reject) => {

    connectTimeout = setTimeout(() => {
      reject(new Error("timeout"));
    }, timeout);

    connectToGATT(device)
      .then(resolve)
      .catch(reject);
  });
}


/// =======================
/// CONNECT KE GATT
/// =======================
async function connectToGATT(device) {

  server = await device.gatt.connect();

  const services = await server.getPrimaryServices();

  for (const svc of services) {
    const chars = await svc.getCharacteristics();

    for (const c of chars) {
      if (c.properties.writeWithoutResponse || c.properties.write) {
        printerCharacteristic = c;
        return;
      }
    }
  }

  throw new Error("Tidak ditemukan characteristic untuk menulis data.");
}


/// =======================
/// CETAK BIASA
/// =======================
async function printLine(text, align = 0) {
  if (!printerCharacteristic) {
    Modal.tutupModalInfo();
    return Modal.modalInfo({
      body: "Printer belum terhubung!",
      btn: { close: { text: "Tutup" } }
    });
  }

  try {
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x61, align]));
    await printerCharacteristic.writeValue(new TextEncoder().encode(text + "\n"));
  } catch (err) {
    putusSaatPrint();
  }
}


/// =======================
/// CETAK STYLE
/// =======================
async function printStyled(text, align = 0, style = 0x00) {
  if (!printerCharacteristic) return;

  try {
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x61, align]));
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x21, style]));
    await printerCharacteristic.writeValue(new TextEncoder().encode(text + "\n"));
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x21, 0x00])); // reset
  } catch (err) {
    putusSaatPrint();
  }
}


/// =======================
/// PESAN PUTUS SAAT PRINT
/// =======================
function putusSaatPrint() {
  Modal.tutupModalInfo();
  Modal.modalInfo({
    body: "Printer terputus saat mencetak!",
    btn: { close: { text: "Tutup" } }
  });
}


/// =======================
/// ALIGN LEFT-RIGHT
/// =======================
function lineLR(left, right, width = 32) {
  let space = width - left.length - right.length;
  if (space < 1) space = 1;
  return left + " ".repeat(space) + right;
}


/// =======================
/// AUTO RECONNECT
/// =======================
async function autoReconnect() {
  if (!printerDevice) return;
  Modal.tutupModalInfo();
  Modal.modalInfo({
    body: "Printer terputus → mencoba reconnect...",
    btn: { close: { text: "OK" } }
  });

  let attempt = 0;

  while (!printerDevice.gatt.connected && attempt < MAX_RECONNECT_ATTEMPT) {
    attempt++;

    try {
      await connectWithTimeout(printerDevice, CONNECT_TIMEOUT_MS);
      
      Modal.tutupModalInfo();
      Modal.modalInfo({
        body: "Berhasil reconnect!",
        btn: { close: { text: "Tutup" } }
      });

      return;

    } catch {
      await new Promise(res => setTimeout(res, RECONNECT_DELAY_MS));
    }
  }

  Modal.tutupModalInfo();
  Modal.modalInfo({
    body: "Gagal reconnect. Silakan scan ulang printer.",
    btn: { close: { text: "Tutup" } }
  });
}


/// =======================
/// AUTO RECONNECT SAAT APP DIBUKA ULANG
/// =======================
async function reconnectIfRemembered() {
  try {
    const savedName = localStorage.getItem("printerName");
    if (!savedName) return;

    // ambil semua perangkat yang sudah pernah diberi izin
    const devices = await navigator.bluetooth.getDevices();

    // cari yang ID-nya sama
    const target = devices.find(d => d.name === savedName);
    if (!target) return;
    

    printerDevice = target;

    printerDevice.addEventListener(
      "gattserverdisconnected",
      autoReconnect
    );

    await connectToGATT(printerDevice);
    
    Modal.tutupModalInfo();
    Modal.modalInfo({
      body: `Auto reconnect ke printer: ${printerDevice.name}`,
      btn: { close: { text: "Tutup" } }
    });

  } catch (err) {
    console.log("Auto reconnect gagal:", err.message);
  }
}

/*
async function reconnectIfRemembered() {
  try {
    const devices = await navigator.bluetooth.getDevices();
    if (devices.length === 0) return;

    printerDevice = devices[0];
    printerDevice.addEventListener("gattserverdisconnected", autoReconnect);

    await connectWithTimeout(printerDevice, CONNECT_TIMEOUT_MS);

    Modal.tutupModalInfo();
    Modal.modalInfo({
      body: `Auto reconnect → ${printerDevice.name}`,
      btn: { close: { text: "Tutup" } }
    });

  } catch { }
}
*/


/// =======================
/// CHECK PRINTER CONNECTED
/// =======================
function cekKoneksiPrinter() {
  if (!printerCharacteristic) {
    document.querySelector(".connection").classList.add("show");
    return false;
  }
  return true;
}


/// =======================
/// TAMPILKAN STATUS
/// =======================
function tampilkanStatusBerhasil() {
  const status = document.querySelector("#status");
  if (status) {
    status.style.color = "blue";
    status.textContent = `Status: Printer ${printerDevice.name} terhubung`;
  }
}


/// =======================
/// TUTUP MODAL KONEKSI
/// =======================
function tutupModalKoneksi() {
  document.querySelector(".connection").classList.remove("show");
}


/// =======================
/// EXPORT
/// =======================
export const Printer = {
  scanBluetooth,
  cekKoneksiPrinter,
  tutupModalKoneksi,
  printLine,
  printStyled,
  lineLR,
  reconnectIfRemembered
};