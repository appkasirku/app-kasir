function capitalizeWords(text) {
  return text.replace(/\s+/g, " ").trimStart().replace(/\b([a-zA-Z])(?=\w*)/g, (m) => m.toUpperCase());
}

// fungsi kalkulasi harga
function kalkulasiHarga() {
	const inputNama = document.getElementById("namaBarang");
	const inputHarga = document.getElementById("hargaBarang");
	const inputJumlah = document.getElementById("jumlahBarang");
	const inputDiskon = document.getElementById("diskonHarga");
	const inputTotalHarga = document.getElementById("totalHarga");
	const inputTotalDiskon = document.getElementById("totalDiskon");
	
	inputNama.value = capitalizeWords(inputNama.value);
	
	if (inputNama.value.trim() === "") {
		if (inputHarga.value.trim() === "0"
		&& inputJumlah.value.trim() === "0"
		&& inputDiskon.value.trim() === "0") {
			inputHarga.value = inputJumlah.value = inputDiskon.value = inputTotalHarga.value = inputTotalDiskon.value = "";
			return;
		}
	}
	
	inputHarga.value = formatRupiah(inputHarga.value.trim().replace(/\D/g, ""));
	
  let v = inputJumlah.value;
  // 1. Jika kosong → jadi 0
  if (v.trim() === "") {
    inputJumlah.value = "0";
    return;
  }
  // 2. Jika user sudah ketik angka selain 0 → hilangkan leading zero
  // contoh: "01" → "1"
  if (/^[0]+[1-9]/.test(v)) {
  	v = v.replace(/^0+/, ""); 
  }
  // 3. Jika user mengetik titik → ubah jadi koma
  v = v.replace(/\./g, ",");
  // Simpan perubahan
  inputJumlah.value = v.replace(/\s/g, "");
	
	inputDiskon.value = formatRupiah(inputDiskon.value.trim().replace(/\D/g, ""));
	
	const harga = Number(inputHarga.value.replace(/\D/g, ""));
	const jumlah = inputJumlah.value.replace(",", ".");
	const diskon = Number(inputDiskon.value.replace(/\D/g, ""));
	const totalHarga = formatRupiah(harga * jumlah);
	const totalDiskon = formatRupiah(diskon * jumlah);
	inputTotalHarga.value = totalHarga;
	inputTotalDiskon.value = totalDiskon;
}

document.querySelectorAll(".box-form input").forEach((input) => {
	input.addEventListener("input", (e) => {
		kalkulasiHarga();
	});
});

const inputDiskonHarga = document.getElementById("diskonHarga")
inputDiskonHarga.addEventListener("focus", () => {
	inputDiskonHarga.removeAttribute("readonly");
});
inputDiskonHarga.addEventListener("blur", () => {
	inputDiskonHarga.setAttribute("readonly", "");
});

document.getElementById("prosesPrint").addEventListener("click", () => {
	if (cart.length === 0) return alert('Belum ada transaksi!');
  document.querySelector(".box-pembayaran").classList.add("show");

  const pembayaran = document.getElementById("pembayaran");
  const totalBelanja = document.querySelector(".tb");
  const sisaUang = document.querySelector(".su");
  
  const subtotal = cart.reduce((a, b) => a + b.subtotal, 0);
  const subdiskon = cart.reduce((a, b) => a + b.subdiskon, 0);
  const total = subtotal - subdiskon;

  // ❗ Hapus listener lama biar tidak dobel-dobel
  pembayaran.replaceWith(pembayaran.cloneNode(true));
  const bayarInput = document.getElementById("pembayaran");

  totalBelanja.textContent = formatRupiah(total);
  bayarInput.focus();
  
  bayarInput.addEventListener("input", () => {
  	// Ambil angka saja
    const angkaBayar = Number(bayarInput.value.replace(/\D/g, ""));

    // Hitung kembalian
    const kmb = angkaBayar - total;

    if (bayarInput.value === "") { bayarInput.value = ""; sisaUang.textContent = "0"; return; }
      
    // Tampilkan format Rupiah di input pembayaran
    bayarInput.value = formatRupiah(angkaBayar);
      
    // Tampilkan kembalian ke layar (format rupiah)
    sisaUang.textContent = formatRupiah(kmb);
  });
});

// fungsi tutup form pembayaran
function tutupPembayaran() {
	document.querySelector(".box-pembayaran").classList.remove("show");
	document.getElementById("pembayaran").value = "";
	document.querySelector(".tb").textContent = "0";
	document.querySelector(".su").textContent = "0";
}

document.getElementById("tutupPembayaran").addEventListener("click", tutupPembayaran);

document.getElementById("perbesar").addEventListener("click", () => {
	const tutup = document.getElementById("tutup");
	const preview = document.querySelector(".box-prev");
	preview.classList.toggle("full");
	tutup.classList.toggle("show");
	tutup.onclick = () => {
		preview.classList.toggle("full");
		tutup.classList.toggle("show");
	}
});

/// ========================================================= //)
/// SCAN SEMUA SERVICE DAN CHARACTERISTIC ///
/// ========================================================= ///

async function scanBluetooth() {
	try {
		const device = await navigator.bluetooth.requestDevice({
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
		
		const server = await device.gatt.connect();
		const services = await server.getPrimaryServices();
		let output = "Hasil:<br>";
		
		document.getElementById("uuid").innerHTML = "Hubungkan 👇";
  } catch (err) {
  	alert("Error: " + err);
  }
}

/// ========================================================= ///
/// KONEKSI PRINTER (AKAN DIPILIH OTOMATIS SETELAH SCAN) ///
/// ========================================================= ///

let printerDevice = null;
let printerCharacteristic = null;

async function connectPrinter() {
  try {
  	printerDevice = await navigator.bluetooth.requestDevice({
  		acceptAllDevices: true,
  		optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb', 0xff00, 0xff01, 0xff02]
  	});

    const server = await printerDevice.gatt.connect();
    const services = await server.getPrimaryServices();

    // >>> Printer thermal BLE PASTI punya characteristic dengan "writeWithoutResponse"
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
      return alert("Tidak ditemukan characteristic untuk mengirim data!");
    }

    const status = document.getElementById("status");
    status.style.color = "blue";
    status.textContent =  `Status: Printer ${printerDevice.name} terhubung`;
    	document.getElementById("formStruk").classList.toggle("hidden");
    	document.getElementById("pembayaran").focus();
      setTimeout(() => {}, 1000);
  } catch (err) {
    alert("Gagal terhubung: " + err);
  }
}

/// ========================================================= ///
/// PRINT STRUK ///
/// ========================================================= ///
async function printLine(text, align = 0) {
	if (!printerCharacteristic) return alert("Printer belum terhubung!");
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

async function writeChunked(characteristic, data, chunkSize = 500) {
	for (let i = 0; i < data.length; i += chunkSize) {
		const chunk = data.slice(i, i + chunkSize);
		await characteristic.writeValue(chunk);
  }
}

function formatRupiah(value) {
	value = Number(value) || 0;
  return value.toLocaleString("id-ID", {
  	minimumFractionDigits: 0,
  	maximumFractionDigits: 0
  });
}

function bukaStruk() {
	const formStruk = document.getElementById("formStruk");
	formStruk.classList.remove("hidden");
	document.getElementById("namaBarang").focus();
}

function tutupStruk() {
	const formStruk = document.getElementById("formStruk");
	formStruk.classList.remove("show");
}

async function printStruk(e) {
  e.preventDefault();
  if (!printerCharacteristic) {
  	document.querySelector(".form-struk").classList.add("hidden");
  	alert("Printer belum terhubung!\n\nSilakan SCAN SERVICES atau langsung Hubungkan Printer.");
  	return;
  }
    
  await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x40])); // reset printer
  
  await printStyled("TB20D", 1, 0x10);
  
  await printStyled("TOKO BERAS 20 DESEMBER", 1, 0x20);
    
  await printLine("\n", 1);
  
  await printLine("Kontak: 0812 8524 2366", 1);
  await printLine("Jl. 20 Desember RT02/RW03", 1);
  
  await printLine("================================");
    
  await printLine(lineLR("Kasir", "Admin Toko"));
  await printLine(lineLR("Tanggal", tanggalSekarang()));
  
  await printLine("================================");

	for (const p of cart) {
		await printLine(`${p.namaBarang}`);
    await printLine(lineLR(`${formatRupiah(p.hargaBarang)} x ${p.jumlahBarang}`, formatRupiah(p.subtotal)));
    if (p.diskonHarga > 0) {
    	await printLine(lineLR(`Diskon: ${formatRupiah(p.diskonHarga)} x ${p.jumlahBarang}`, formatRupiah(p.subdiskon)));
    }
	}
		
	await printLine("================================");
		
	const printSubtotal = cart.reduce((a, b) => a + b.subtotal, 0);
	const printDiskon = cart.reduce((a, b) => a + b.subdiskon, 0);
	const printTotal = printSubtotal - printDiskon;

  await printLine(lineLR("Subtotal", formatRupiah(printSubtotal)));
  await printLine(lineLR("Total Diskon", formatRupiah(printDiskon)));
  await printLine(lineLR("Total Belanja", formatRupiah(printTotal)));
  
	await printLine("================================");
		
	const printBayar = document.getElementById("pembayaran").value;
	const printKembali = document.querySelector(".su").textContent;
	
  await printLine(lineLR("Dibayar", printBayar));
  await printLine(lineLR("Kembalian", printKembali));
   
	await printLine("================================");
 
	await printLine("Terima Kasih", 1);
  await printLine("Sudah Berbelanja", 1);
  await printLine("\n\n", 1);
  
  cart.length = 0;
  tampilkanStruk();
	tutupPembayaran();
	document.getElementById("namaBarang").focus();
}

async function buatStruk() {
  if (!printerCharacteristic) {
    return alert("Printer belum terhubung!");
  }

  let esc_init = new Uint8Array([0x1B, 0x40]); 
  let esc_align_left = new Uint8Array([0x1B, 0x61, 0x00]);
  
  bukaStruk();
}

// fungsi tampilkan struk
function tampilkanStruk() {
	const listProduk = document.querySelector(".produk");
	listProduk.innerHTML = "";
	if (cart.length > 0) {
		cart.forEach((p, i) => {
			listProduk.innerHTML += `
			<div target-data="${i}" class="item" style="padding:2px 0">
				<span class="n-produk">${p.namaBarang}</span>
				<div class="flex">
					<span class="hxj">   ${formatRupiah(p.hargaBarang)} x ${p.jumlahBarang.toString().replace(".", ",")}</span>
					<span class="sth">${formatRupiah(p.subtotal)}</span>
				</div>
				<duv class="flex">
					${p.subdiskon != 0 ? `<span>Diskon: ${formatRupiah(p.diskonHarga)} x ${p.jumlahBarang.toString().replace(".", ",")}</span>
					<span>${formatRupiah(p.subdiskon)}</span>` : ""}
				</div>
			</div>
			`;
		});
		
		const elSubtotal = cart.reduce((a, b) => a + b.subtotal, 0);
		const elDiskon = cart.reduce((a, b) => a + b.subdiskon, 0);
		const elTotal = elSubtotal - elDiskon;
		document.querySelector(".el-subtotal").textContent = formatRupiah(elSubtotal);
		document.querySelector(".el-diskon").textContent = formatRupiah(elDiskon);
		document.querySelector(".el-total").textContent = formatRupiah(elTotal);
	} else {
		listProduk.innerHTML = `<div style="padding:4px;text-align:center;color:#aaa;font-weight:bold">Struk Belanja</div>`;
		document.querySelector(".el-subtotal").textContent = "0";
		document.querySelector(".el-diskon").textContent = "0";
		document.querySelector(".el-total").textContent = "0";
	}
}

// hapus produk dari array cart dan perbarui tampilan struk
document.querySelector(".produk").addEventListener("click", (e) => {
	const item = e.target.closest(".item");
  if (!item) return;
  const idx = Number(item.getAttribute("target-data"));
  const nama = item.querySelector(".n-produk").textContent;
  if (!confirm(`Hapus ${nama}?`)) return;
  cart.splice(idx, 1);
  tampilkanStruk();
  playBell();
});

// fungsi input transaksi
let cart = [];

function inputTransaksi(e) {
	e.preventDefault();
	const inputNamaBarang = document.getElementById("namaBarang");
	const inputHargaBarang = document.getElementById("hargaBarang");
	const inputJumlahBarang = document.getElementById("jumlahBarang");
	if (inputNamaBarang.value.trim() === "") {
		inputNamaBarang.focus();
		return;
	}
	if (inputHargaBarang.value.trim() === "" || inputHargaBarang.value.trim() === "0") {
		inputHargaBarang.focus();
		return;
	}
	if (inputJumlahBarang.value.trim() === "" || inputJumlahBarang.value.trim() === "0") {
		inputJumlahBarang.focus();
		return;
	}
	const namaBarang = document.getElementById("namaBarang").value;
	const hargaBarang = Number(document.getElementById("hargaBarang").value.replace(/\./g, ""));
	const jumlahBarang = Number(document.getElementById("jumlahBarang").value.replace(",", "."));
	const diskonHarga = Number(document.getElementById("diskonHarga").value.replace(/\./, ""));
	
	const subtotal = hargaBarang * jumlahBarang;
	const subdiskon = diskonHarga * jumlahBarang;
	
	cart.push({
		namaBarang,
		hargaBarang,
		jumlahBarang,
		diskonHarga,
		subtotal,
		subdiskon
	});
	
	tampilkanStruk();
	document.querySelector("#formStruk form").reset();
	inputNamaBarang.focus();
	playBell();
}

function tanggalSekarang(date = new Date()) {
	const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const tgl = date.getDate();
  const bln = bulan[date.getMonth()];
  const thn = date.getFullYear();
  const jam = String(date.getHours()).padStart(2, "0");
  const menit = String(date.getMinutes()).padStart(2, "0");
  return `${tgl} ${bln} ${thn} ${jam}:${menit}`;
}

document.querySelector(".tanggal").textContent = tanggalSekarang();

document.getElementById("inputTransaksi").addEventListener("click", inputTransaksi);

document.getElementById("printStruk").addEventListener("click", printStruk);

document.getElementById("tutupStruk").addEventListener("click", tutupStruk);

// fungsi bunyi bell saat terjadi suatu proses
function playBell() {
	const bell = document.getElementById("soundBeep");
  if (!bell) return;
	bell.currentTime = 0;
	bell.play();
}





// fungsi auto rekonek bluetooth printer
/*
let device;
let server;
let service;
let characteristic;

const SERVICE_UUID = "000018f0-0000-1000-8000-00805f9b34fb"; // umumnya untuk ESC/POS BT
const CHARACTERISTIC_UUID = "00002af1-0000-1000-8000-00805f9b34fb";

async function firstConnect() {
  try {
    device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "Printer" }],
      optionalServices: [SERVICE_UUID]
    });

    device.addEventListener('gattserverdisconnected', autoReconnect);
    await connect();
  } catch (e) {
    console.log("User cancelled or error:", e);
  }
}

async function connect() {
  server = await device.gatt.connect();
  service = await server.getPrimaryService(SERVICE_UUID);
  characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
  console.log("Connected to printer");
}

async function autoReconnect() {
  console.log("Disconnected → trying reconnect...");

  while (!device.gatt.connected) {
    try {
      await connect();
      console.log("Reconnected!");
      break;
    } catch (e) {
      console.log("Retrying in 2 sec...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function reconnectIfRemembered() {
  const remembered = await navigator.bluetooth.getDevices();
  if (remembered.length > 0) {
    device = remembered[0];
    device.addEventListener('gattserverdisconnected', autoReconnect);
    await connect();
  }
}
*/
let device;
let server;
let service;
let characteristic;

const SERVICE_UUID = 0xFFE0;
const CHARACTERISTIC_UUID = 0xFFE1;

// ========= CONNECT PERTAMA (POPUP) ==========
async function firstConnect() {
  try {
    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }],
      optionalServices: [SERVICE_UUID]
    });

    device.addEventListener("gattserverdisconnected", autoReconnect);
    await connect();
    console.log("First connection success!");
  } catch (e) {
    console.log("User cancelled or error", e);
  }
}

// ========= CONNECT TANPA POPUP (REMEMBERED DEVICE) ==========
async function reconnectIfRemembered() {
  const devices = await navigator.bluetooth.getDevices();

  if (devices.length === 0) return; // belum pernah connect

  device = devices[0];
  device.addEventListener("gattserverdisconnected", autoReconnect);

  try {
    await connect();
    console.log("Auto reconnected to remembered device!");
  } catch (e) {
    console.log("Failed reconnect, waiting printer...");
    autoReconnect();
  }
}

// ========= PROSES CONNECT GATT ==========
async function connect() {
  server = await device.gatt.connect();
  service = await server.getPrimaryService(SERVICE_UUID);
  characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
}

// ========= AUTO RECONNECT JIKA PUTUS ==========
async function autoReconnect() {
  console.log("Printer disconnected → trying reconnect...");

  while (device && !device.gatt.connected) {
    try {
      await connect();
      console.log("Reconnected!");
      break;
    } catch (e) {
      console.log("Retry in 2s…");
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

// ========= PRINT DATA ESC/POS ==========
async function printText(text) {
  if (!characteristic) return alert("Printer belum tersambung!");

  const encoder = new TextEncoder();
  const data = encoder.encode(text + "\n");
  await characteristic.writeValue(data);
}