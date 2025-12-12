import { Modal } from './modal.js';

// set varibel global
let printerDevice = null;
let printerCharacteristic = null;
let server = null;
let isConnecting = false;
let connectTimeout = null;
const CONNECT_TIMEOUT_MS = 8000; // timeout koneksi awal
const RECONNECT_DELAY_MS = 3000; // jeda reconnect
const MAX_RECONNECT_ATTEMPT = 10; // jumlah percobaan reconnect

// fungsi untama scan bluetooth koneksi printer
async function scanBluetooth() {
  try {
    if (isConnecting) return;
    isConnecting = true;
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
      tutupModalKoneksi();
    }, 200);
    // aktifkan auto reconnect
    printerDevice.addEventListener("gattserverdisconnected", autoReconnect);
  } catch (err) {
    Modal.tutupModalInfo();
    if (err.name === "NotFoundError") {
      // user menutup dialog bluetooth → tidak apa-apa
    } else if (err.message.includes("timeout")) {
      Modal.tutupModalInfo();
      Modal.modalInfo({
        body: "Waktu koneksi habis! Printer tidak merespons.",
        btn: { batal: { text: "Tutup" } }
      });
    } else if (err.message.includes("Connection attempt failed")) {
      Modal.tutupModalInfo();
      Modal.modalInfo({
        body: "Tidak bisa terhubung! Matikan dan hidupkan ulang printer.",
        btn: { batal: { text: "Tutup" } }
      });
    } else {
      Modal.tutupModalInfo();
      Modal.modalInfo({
        body: "Error: " + err.message,
        btn: { batal: { text: "Tutup" } }
      });
    }
  } finally {
    isConnecting = false;
    clearTimeout(connectTimeout);
  }
}

// fungsi koneksi timeout khusus
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

// fungsi koneksi ke gatt
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

// fungsi print line atau cetak biasa
async function printLine(text, align = 0) {
  if (!printerCharacteristic) {
    Modal.tutupModalInfo();
    return Modal.modalInfo({
      body: "Printer belum terhubung!",
      btn: { batal: { text: "Tutup" } }
    });
  }
  try {
    // set alignment
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x61, align]));
    // set font paling kecil
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x4D, 0x01]));
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x21, 0x00]));
    // print text
    await printerCharacteristic.writeValue(new TextEncoder().encode(text + "\n"));
    // reset font ke default (optional)
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x4D, 0x00]));
  } catch (err) {
    putusSaatPrint();
  }
}

// fungsi style printer
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

// fungsi koneksi printer putus saat proses print
function putusSaatPrint() {
  Modal.tutupModalInfo();
  Modal.modalInfo({
    body: "Printer terputus saat mencetak!",
    btn: { batal: { text: "Tutup" } }
  });
}

// fungsi rata kiri kanan
function lineLR(left, right, width = 32) {
  let space = width - left.length - right.length;
  if (space < 1) space = 1;
  return left + " ".repeat(space) + right;
}

// fungsi otomatis rekoneksi
async function autoReconnect() {
  if (!printerDevice) return;
  Modal.tutupModalInfo();
  Modal.modalInfo({
    body: "Printer terputus → mencoba reconnect...",
    btn: { batal: { text: "OK" } }
  });
  let attempt = 0;
  while (!printerDevice.gatt.connected && attempt < MAX_RECONNECT_ATTEMPT) {
    attempt++;
    try {
      await connectWithTimeout(printerDevice, CONNECT_TIMEOUT_MS);
      Modal.tutupModalInfo();
      Modal.modalInfo({
        body: "Berhasil reconnect!",
        btn: { batal: { text: "Tutup" } }
      });
      return;
    } catch {
      await new Promise(res => setTimeout(res, RECONNECT_DELAY_MS));
    }
  }
  Modal.tutupModalInfo();
  Modal.modalInfo({
    body: "Gagal reconnect. Silakan scan ulang printer.",
    btn: { batal: { text: "Tutup" } }
  });
}

// fungsi koneksi ulang printer
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
      btn: { batal: { text: "Tutup" } }
    });
  } catch (err) {
    console.log("Auto reconnect gagal:", err.message);
  }
}

// fungsi cwk koneksi printer
function cekKoneksiPrinter() {
  document.querySelector("body")?.classList.add("overhide");
  if (!printerCharacteristic) {
    document.querySelector(".connection").classList.add("show");
    return false;
  }
  return true;
}

// fungsi tampilan status koneksi printer
function tampilkanStatusBerhasil() {
  const status = document.querySelector("#status");
  if (status) {
    status.style.color = "blue";
    status.textContent = `Status: Printer ${printerDevice.name} terhubung`;
  }
}

// fungsi tutup model koneksi printer
function tutupModalKoneksi() {
  document.querySelector("body")?.classList.remove("overhide");
  document.querySelector(".connection")?.classList.remove("show");
}

export const Printer = {
  scanBluetooth,
  cekKoneksiPrinter,
  tutupModalKoneksi,
  printLine,
  printStyled,
  lineLR,
  reconnectIfRemembered
};