// import semua fungsi yang dibutuhkan
import { Install } from './install.js';
import { Helpers } from './helpers.js';
import { Struk } from './receipt.js';
import { Scanner } from './scanner.js';
import { Printer } from './printer.js';
import { Produk } from './product.js';
import { Transaksi } from './transaction.js';

// saat halaman dimuat
document.addEventListener("DOMContentLoaded", initApp);

// fungsi utama initApp
function initApp() {
  
  // reload otomatis saat aplikasi dibuka kembali
  Helpers.firstRelodingDataApp();
  // tampilkan trasaksi terakhir
  Transaksi.tampilkanTransaksiTerakhir();
  // koneksi ulang otomatis
  Printer.reconnectIfRemembered();
  // tampilkan data struk
  Struk.tampilkanDataStrukPreviewStruk();
  
  // tampilkan tanggal
  const tanggal = document.querySelector(".tanggal");
  if (tanggal) {
    tanggal.textContent = Helpers.tanggalSekarang();
  }
  
  // event kalkulasi harga form transaksi
  document.querySelectorAll(".box-form input").forEach((input) => {
  	input.addEventListener("input", (e) => {
  		Helpers.kalkulasiHarga();
  	});
  });
  
  // pencarian langsung form transaksi
  const namaBarangEl = document.querySelector("#namaBarang");
  namaBarangEl?.addEventListener("input", () => {
    setTimeout(() => {
  	Transaksi.liveSearchProduk(namaBarangEl);
    }, 150);
  });
  // munculkan tombol di input nama produk
  namaBarangEl?.addEventListener("focus", () => {
    Transaksi.showButtonInputNamaProduk();
  });
  // sembunyikan tombol di input nama produk saat blur sesuai kondisi
  namaBarangEl?.addEventListener("blur", () => {
    const closeSearch = document.querySelector(".hasil-pencarian");
    const checkResult = closeSearch.classList.contains("show");
    if (namaBarangEl.value.trim() === "" || checkResult) {
      Transaksi.hideButtonInputNamaProduk();
    } else {
      Transaksi.showButtonInputNamaProduk();
    }
  });
  
  // tombol tutup hasil pencarian produk form transaksi
  document.querySelector("#tutupHasilPencarian")?.addEventListener("click", () => Transaksi.tutupHasilPencarian("clicked"));
  
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
  	// cek koneksi printer sebelum proses pembayaran
  	if (!Printer.cekKoneksiPrinter()) return;
    // cek data keranjang sebelum diproses
    if (!Transaksi.cekDataKeranjang()) return;
  	// buka modal pembayaran
  	Transaksi.modalPembayaran();
  });
  
  // tombol simpan data struk
  document.querySelector("#simpanDataStruk")?.addEventListener("click", Struk.simpanDataStruk);
  
  // tombol reset form pengaturan
  document.querySelector("#resetPengaturan")?.addEventListener("click", Struk.resetPengaturan);
  
  // tombol buka pengaturan struk
  document.querySelector("#bukaPengaturan")?.addEventListener("click", Struk.bukaPengaturanStruk);
  
  // tombol tutup pengaturan struk
  document.querySelector("#tutupPengaturan")?.addEventListener("click", Struk.tutupPengaturanStruk);
  
  // tombol reset form produk
  document.querySelector("#resetFormProduk")?.addEventListener("click", Produk.resetFormProduk);
  
  // tombol buka form produk
  document.querySelector("#bukaFormProduk")?.addEventListener("click", () => {
    if (!Install.isAppInstalled()) {
      let mode = "instal";
      if (localStorage.getItem("appKasirInstalled") === "yes") {
        mode = "buka";
      }
      return Install.toast(`Harap ${mode} aplikasi`, document.querySelector("#btnInstallApp"));
    }
  	Produk.bukaFormProduk();
  	Produk.validasiInputProduk();
  });
  
  // tombol tutup modal form produk
  document.querySelector("#tutupFormProduk")?.addEventListener("click", Produk.tutupFormProduk);
  
  // tombol simpan data produk
  document.querySelector("#simpanFormProduk")?.addEventListener("click", Produk.simpanFormProduk);
  
  // tombol scan input transaksi
  document.querySelector("#btnScan")?.addEventListener("click", () => Scanner.openScanner("transaksi"));
  
  // tombol scan input produk
  document.querySelector("#btnScanIpro")?.addEventListener("click", () => Scanner.openScanner("produk"));
  
  // tombol tutup proses scanner
  document.querySelector("#closeScanner")?.addEventListener("click", Scanner.stopScanner);
  
  // tombol on/off flash scanner
  document.querySelector("#btnFlash")?.addEventListener("click", Scanner.toggleFlassScanner);
  
  // tombol scan dari file
  document.querySelector("#btnScanFile")?.addEventListener("click", Scanner.scannerFile);
  
  // tombol lihat atau perbesar struk
  document.querySelector("#perbesar")?.addEventListener("click", () => {
    Transaksi.lihatStruk();
  });
  
  // tombol hapus transaksi terakhir
  document.querySelector("#kosongkan")?.addEventListener("click", Transaksi.hapusTransaksiTerakhir);
  
  // even klik
  document.addEventListener("click", (e) => {
    // pilih produk hasil pencarian transaksi
    if (e.target.closest("[data-target-kode]") || e.target.closest("[data-target-rule]")) {
  		const kode = e.target.closest("[data-target-kode]").dataset.targetKode;
  		const rule = e.target.closest("[data-target-rule]").dataset.targetRule;
  		let jumlah;
  		if (e.target.closest("[data-target-jumlah]")) {
  		  jumlah = e.target.closest("[data-target-jumlah]").dataset.targetJumlah;
  		} else {
  		  jumlah = 1;
  		}
  		Transaksi.pilihProduk(kode, rule, jumlah);
  		return;
  	}
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
  	// tombol pilihan edit, hapus keranjang
  	if (e.target.closest("[data-pilihan-edit-hapus-keranjang]")) {
  		const i = e.target.closest("[data-pilihan-edit-hapus-keranjang]").dataset.pilihanEditHapusKeranjang;
  		const nama = e.target.closest("[data-nama-barang-keranjang]").dataset.namaBarangKeranjang;
  	  Transaksi.pilihanEditHapusKeranjang(i, nama);
  	  return;
  	}
  	// tombol edit keranjang
  	if (e.target.closest("[data-edit-keranjang]")) {
  		const i = e.target.closest("[data-edit-keranjang]").dataset.editKeranjang;
  		Transaksi.editKeranjang(i);
  		return;
  	}
  	// tombol edit produk
  	if (e.target.closest("[data-edit]")) {
  		const kode = e.target.closest("[data-edit]").dataset.edit;
  		Produk.editProduk(kode);
  		return;
  	}
  	// tombol hapus produk
  	if (e.target.closest("[data-pilihan-edit-hapus-produk]")) {
  		const kode = e.target.closest("[data-pilihan-edit-hapus-produk]").dataset.pilihanEditHapusProduk;
  		Produk.pilihanEditHapusProduk(kode);
  		return;
  	}
  });
  
}