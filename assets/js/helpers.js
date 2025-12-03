// fungsi tanggal sekarang
function tanggalSekarang(date = new Date()) {
	const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const tgl = date.getDate();
  const bln = bulan[date.getMonth()];
  const thn = date.getFullYear();
  const jam = String(date.getHours()).padStart(2, "0");
  const menit = String(date.getMinutes()).padStart(2, "0");
  return `${tgl} ${bln} ${thn} ${jam}:${menit}`;
}

// fungsi huruf kapital otomatis
function capitalizeWords(text) {
  return text.replace(/\s+/g, " ").trimStart().replace(/\b([a-zA-Z])(?=\w*)/g, (m) => m.toUpperCase());
}

// fungsi auto spasi diantara angka pada nama produk
function autoSpasiAngka(el) {
  let v = el.value;
  // spasi sebelum angka
  v = v.replace(/([A-Za-z])(\d)/g, "$1 $2");
  // spasi setelah angka
  v = v.replace(/(\d)([A-Za-z])/g, "$1 $2");
  // rapikan spasi berlebih
  v = v.replace(/\s+/g, " ");
  // spasi di akhir jika masih mengetik
  return el.value = v.trimStart();
}

// fungsi hapus ukuran/berat produk dari nama produk
function bersihkanUkuran(text) {
	return text.replace(
		/\b\d+\s*(kg|kilo|g|gram|mg|ton|ml|ltr|lt|liter|pcs|pack|bungkus|ons|lb)\b/gi,
		""
	).replace(/\s+/g, " ");
}

// fungsi format nama produk, max 20
function inputFormatNama(el) {
	if (el.value.length > 20) el.value = el.value.slice(0, 20);
	return capitalizeWords(bersihkanUkuran(el.value));
}

// fungsi format berat produk, max 10
function inputFormatBerat(el) {
	if (el.value.length > 10) el.value = el.value.slice(0, 10);
	autoSpasiAngka(el);
	return capitalizeWords(el.value);
}

// fungsi format kode produk, max 15
function inputFormatKode(el) {
	if (el.value.length > 15) el.value = el.value.slice(0, 15);
	return el.value = el.value.trim().toUpperCase();
}

// fungsi format harga produk, max 10
function inputFormatHarga(el) {
	if (el.value.length > 10) el.value = el.value.slice(0, 10);
	return el.value = formatRupiah(el.value.trim().replace(/\D/g, ""));
} 

// fungsi format rupiah
function formatRupiah(value) {
	value = Number(value) || 0;
  return value.toLocaleString("id-ID", {
  	minimumFractionDigits: 0,
  	maximumFractionDigits: 0
  });
}

// fungsi kalkulasi harga
function kalkulasiHarga() {
	const inputNama = document.querySelector("#namaBarang");
	const inputHarga = document.querySelector("#hargaBarang");
	const inputJumlah = document.querySelector("#jumlahBarang");
	const inputDiskon = document.querySelector("#diskonHarga");
	const inputTotalHarga = document.querySelector("#totalHarga");
	const inputTotalDiskon = document.querySelector("#totalDiskon");
	
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

// fungsi bersihkan elemen html
function stripHTML(text) {
	const div = document.createElement("div");
	div.innerHTML = text;
	return div.textContent || "";
}

export const Helpers = {
	tanggalSekarang,
	capitalizeWords,
	autoSpasiAngka,
	bersihkanUkuran,
	inputFormatNama,
	inputFormatBerat,
	inputFormatKode,
	formatRupiah,
	inputFormatHarga,
	kalkulasiHarga,
	stripHTML
};