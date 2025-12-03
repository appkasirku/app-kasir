// import fungsi yang dibutuhkan
import { Helpers } from './helpers.js';
import { Modal } from './modal.js';
import { Toko } from './store.js';
import { Scanner } from './scanner.js';
import { Printer } from './printer.js';
import { Produk } from './product.js';
import { Transaksi } from './transaction.js';

// koneksi ulang otomatis
Printer.reconnectIfRemembered();

// tampilkan data Toko
Toko.tampilkanDataTokoPreviewStruk();

// tampilkan tanggal
document.querySelector(".tanggal").textContent = Helpers.tanggalSekarang();

// event kalkulasi harga form transaksi
document.querySelectorAll(".box-form input").forEach((input) => {
	input.addEventListener("input", (e) => {
		Helpers.kalkulasiHarga();
	});
});

// live search form transaksi
const namaBarangEl = document.querySelector("#namaBarang");
const tambahProdukEl = document.querySelector("#bukaFormProduk");
namaBarangEl?.addEventListener("input", () => {
	Transaksi.liveSearchProduk(namaBarangEl);
});
namaBarangEl?.addEventListener("focus", () => {
	tambahProdukEl.style.display = "none";
});
namaBarangEl?.addEventListener("blur", () => {
	if (namaBarangEl.value.trim() !== "") {
	tambahProdukEl.style.display = "none";
	} else {
		setTimeout(() => {
			tambahProdukEl.style.display = "flex";
		}, 250);
	}
});

// pilih produk hasil pencarian form transaksi
document.addEventListener("click", (e) => {
	if (e.target.closest("[data-target-kode]") || e.target.closest("[data-target-rule]")) {
		const kode = e.target.closest("[data-target-kode]").dataset.targetKode;
		const rule = e.target.closest("[data-target-rule]").dataset.targetRule;
		Transaksi.pilihProduk(kode, rule);
		return;
	}
});

// event focus diskon harga form transaksi
const inputDiskonHarga = document.querySelector("#diskonHarga")
inputDiskonHarga?.addEventListener("focus", () => {
	inputDiskonHarga.removeAttribute("readonly");
});
// event blur diskon harga form transaksi
inputDiskonHarga?.addEventListener("blur", () => {
	inputDiskonHarga.setAttribute("readonly", "");
});

// tombol input transaksi
document.querySelector("#inputTransaksi")?.addEventListener("click", Transaksi.inputTransaksi);

// proses print transaksi
document.querySelector("#prosesPrint")?.addEventListener("click", () => {
	if (Transaksi.cart.length === 0) {
		return Modal.modalInfo({
			title: 'Transaksi Kosong',
			body: 'Belum ada transaksi untuk diproses!',
			btn: { close: { text: 'Tutup' } }
		});
	}
	// cek koneksi ke printer sebelum proses pembayaran
	if (!Printer.cekKoneksiPrinter()) return;
	Modal.modalInfo({
		title: 'Form Pembayaran',
		body: `
			<form id="formPembayaran">
				<div class="row">
					<label>Nominal Bayar</label>
					<input id="nominalBayar" inputmode="numeric">
				</div>
				<div class="row">
					<label>Total Belanja</label>
					<input id="totalBelanja" inputmode="numeric" readonly>
				</div>
				<div class="row">
					<label>Kembalian</label>
					<input id="kembalian" inputmode="numeric" readonly>
				</div>
			</form>
		`,
		btn: {
			close: { text: "Batal" },
			oke: {
				text: `<i class="fa-solid fa-print"></i> Print`,
				rule: 'print-struk-belanja'
			}
		}
	});
	document.querySelector(".modal-info").classList.add("info-form");
	const pembayaran = document.querySelector("#nominalBayar");
  const totalBelanja = document.querySelector("#totalBelanja");
  const sisaUang = document.querySelector("#kembalian");
  const subtotal = Transaksi.cart.reduce((a, b) => a + b.subtotal, 0);
  const subdiskon = Transaksi.cart.reduce((a, b) => a + b.subdiskon, 0);
  const total = subtotal - subdiskon;
  // ❗ Hapus listener lama biar tidak dobel-dobel
  pembayaran.replaceWith(pembayaran.cloneNode(true));
  const bayarInput = document.querySelector("#nominalBayar");
  totalBelanja.value = Helpers.formatRupiah(total);
  bayarInput.focus();
  bayarInput.addEventListener("input", () => {
  	// Ambil angka saja
    const angkaBayar = Number(bayarInput.value.replace(/\D/g, ""));
    // Hitung kembalian
    const kmb = angkaBayar - total;
    if (bayarInput.value === "") { bayarInput.value = ""; sisaUang.value = "0"; return; }
    // Tampilkan format Rupiah di input pembayaran
    bayarInput.value = Helpers.formatRupiah(angkaBayar);
    // Tampilkan kembalian ke layar (format rupiah)
    sisaUang.value = Helpers.formatRupiah(kmb);
  });
});

// tombol simpan data toko
document.getElementById("simpanDataToko")?.addEventListener("click", Toko.simpanDataToko);

// tombol buka pengaturan toko
document.querySelector("#bukaPengaturan")?.addEventListener("click", Toko.bukaPengaturanToko);

// tombol tutup pengaturan toko
document.querySelector("#tutupPengaturan")?.addEventListener("click", Toko.tutupPengaturanToko);

// tombol buka form input produk
document.querySelector("#bukaFormProduk")?.addEventListener("click", () => {
	Produk.bukaFormProduk();
	Produk.validasiInputProduk();
});

// tombol tutup modal form input produk
document.querySelector("#tutupFormProduk")?.addEventListener("click", Produk.tutupFormProduk);

// tombol simpan data produk
document.querySelector("#simpanFormProduk")?.addEventListener("click", Produk.simpanFormProduk);

document.addEventListener("click", (e) => {
	// tombol scan printer bluetooth
	if (e.target.closest("[data-scan-bluetooth]")) {
		Printer.scanBluetooth();
		return;
	}
	// tombol tutup modal koneksi
	if (e.target.closest("[data-tutup-modal-koneksi]")) {
		Printer.tutupModalKoneksi();
		return;
	}
	// tombol edit keranjang
	if (e.target.closest("[data-edit-keranjang]")) {
		const i = e.target.closest("[data-edit-keranjang]").dataset.editKeranjang;
		Transaksi.editKeranjang(i);
		return;
	}
	// tombol hapus keranjang
	if (e.target.closest("[data-hapus-keranjang]") || e.target.closest("[data-nama-barang-keranjang]")) {
		const i = e.target.closest("[data-hapus-keranjang]").dataset.hapusKeranjang;
		const nama = e.target.closest("[data-nama-barang-keranjang]").dataset.namaBarangKeranjang;
		Transaksi.hapusKeranjang(i, nama);
		return;
	}
	// tombol edit produk
	if (e.target.closest("[data-edit]")) {
		const kode = e.target.closest("[data-edit]").dataset.edit;
		Produk.editProduk(kode);
		return;
	}
	// tombol hapus produk
	if (e.target.closest("[data-hapus]")) {
		const kode = e.target.closest("[data-hapus]").dataset.hapus;
		Produk.hapusProduk(kode);
		return;
	}
});

// tombol scan input transaksi
document.getElementById("btnScan")?.addEventListener("click", () => Scanner.openScanner("transaksi"));

// tombol scan input produk
document.getElementById("btnScanIpro")?.addEventListener("click", () => Scanner.openScanner("produk"));

// tombol tutup proses scanner
document.getElementById("closeScanner")?.addEventListener("click", Scanner.stopScanner);

// tombol lihat atau perbesar struk
document.getElementById("perbesar")?.addEventListener("click", Transaksi.lihatStruk);