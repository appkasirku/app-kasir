import { Install } from './install.js';
import { Modal } from './modal.js';
import { Sound } from './sound.js';
import { Helpers } from './helpers.js';
import { Printer } from './printer.js';

// variabel global cart transaksi
let cart = [];

// fungsi hitung total
function hitungTotal(target, jumlah, diskon) {
	jumlah = jumlah.replace(",", ".");
	diskon = diskon.replace(/\./g, "");
	const subdis = diskon * jumlah;
	const subtot = cart[target].hargaBarang * jumlah;
	cart[target].jumlahBarang = jumlah;
	cart[target].diskonHarga = diskon;
	cart[target].subtotal = subtot;
	cart[target].subdiskon = subdis;
}

// fungsi pilih produk hasil pencarian & hasil scan produk
function pilihProduk(kode, rule, jumlah) {
	  if (jumlah === "" || jumlah === "0") jumlah = validasiJumlahKosong();
	const daftarProduk = JSON.parse(localStorage.getItem("dataProduk")) || [];
	const produk = daftarProduk.find(p => p.kodeProduk === kode);
	if (produk) {
		const elNama = document.querySelector("#namaBarang");
		const elHarga = document.querySelector("#hargaBarang");
		const elJumlah = document.querySelector("#jumlahBarang");
		const elDiskon = document.querySelector("#diskonHarga");
		const elTotalHarga = document.querySelector("#totalHarga");
		elNama.value = `${produk.namaProduk} ${produk.beratProduk}`;
		elHarga.value = produk.hargaProduk;
		if (rule !== "" || rule === "addpro") {
			const namaBarang = elNama.value;
			const hargaBarang = Number(elHarga.value.replace(/\D/g, ""));
			const jumlahBarang = Number(jumlah.replace(",", "."));
			const diskonHarga = Number(elDiskon.value.replace(/\D/g, ""));
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
			tutupHasilPencarian();
			simpanTransaksiTerakhir(cart);
			Sound.playBell();
			document.querySelector("#formStruk form")?.reset();
		} else {
	    tutupHasilPencarian();
			elDiskon.focus();
			elJumlah.value = jumlah;
			elTotalHarga.value = Helpers.formatRupiah(elHarga.value.replace(/\D/g, "") * jumlah.replace(",", "."));
		}
	} else {
		const elNama = document.querySelector("#namaBarang");
		elNama.focus();
		elNama.value = kode;
	}
}

// fungsi pencarian live produk
function liveSearchProduk(el) {
	showButtonInputNamaProduk();
  document.querySelector("body")?.classList.add("overhide");
	document.querySelector(".hasil-pencarian")?.classList.add("show");
	const listProduk = document.querySelector("#hasilPencarian");
	const daftarProduk = JSON.parse(localStorage.getItem("dataProduk")) || [];
	const hasil = daftarProduk.filter(p => p.kodeProduk.toLowerCase().includes(el.value.toLowerCase()) || p.namaProduk.toLowerCase().includes(el.value.toLowerCase()));
	let rounded = "";
	if (hasil.length === 0 || hasil.length === 1) {
	  rounded = ' class="rounded"';
	}
	if (hasil.length > 0) {
	  hideButtonInputNamaProduk();
  	listProduk.innerHTML = hasil.map(p => `
  		<li${rounded}>
  			<span data-title-info="Klik nama produk untuk masukkan diskon" data-target-jumlah="1" data-target-kode="${p.kodeProduk}" data-target-rule="" class="nama-produk">
  				${p.namaProduk} ${p.beratProduk}
  			</span>
  			<span>
  			  <input data-title-info="Edit jumlah" inputmode="numeric" value="1" class="jumpro">
  			</span>
  			<span data-title-info="Tambah ke keranjang" data-target-jumlah="1" data-target-kode="${p.kodeProduk}" data-target-rule="addpro" class="btn-plus">
  				<i class="fa-solid fa-check"></i>
  			</span>
  		</li>
  	`).join("");
  	validasiJumlahKosong();
  	Helpers.tampilkanInfoTombol();
	} else {
		tutupHasilPencarian();
	}
	const jumpro = document.querySelectorAll(".jumpro");
	const jumlahTarget1 = document.querySelectorAll(".nama-produk");
	const jumlahTarget2 = document.querySelectorAll(".btn-plus");
	jumpro.forEach((input, i) => {
	  input.addEventListener("focus", () => input.select());
	  input.addEventListener("input", () => {
	    input.value = input.value.replace(/\./g, ",");
	    jumlahTarget1[i].dataset.targetJumlah = input.value;
	    jumlahTarget2[i].dataset.targetJumlah = input.value;
	  });
	});
	if (el.value.trim() === "") {
		tutupHasilPencarian();
		document.querySelector("#formStruk form")?.reset();
		showButtonInputNamaProduk();
	}
}

// fungsi show button input nama produk
function showButtonInputNamaProduk() {
  const btnInputNamaProduk = document.querySelector("#btnInputNamaProduk");
  if (btnInputNamaProduk) {
    btnInputNamaProduk.classList.add("show");
    btnInputNamaProduk.addEventListener("click", clickButtonInputNamaProduk);
  }
}

// klik tombol input nama produk
function clickButtonInputNamaProduk() {
  const inputs = document.querySelectorAll(".box-form input");
  //const namaBarang = document.querySelector(".box-form #namaBarang");
  inputs?.forEach((e) => {
    e.value = "";
  });
  if (inputs[0]) {
    inputs[0].value = "";
    inputs[0].focus();
  }
}

// fungsi hide button input nama produk
function hideButtonInputNamaProduk() {
  document.querySelector("#btnInputNamaProduk")?.classList.remove("show");
}

// fungsi print struk belanja
async function printStrukBelanja() {
  try {
  	const bayar = document.querySelector("#nominalBayar");
  	if (!bayar?.value.trim()) {
  		bayar.focus();
  		return false;
  	}
    
    const struk = JSON.parse(localStorage.getItem("dataStruk")) || [];
    
    await Printer.printStyled(`${struk.namaToko}`, 1, 0x12);
    await Printer.printLine("\n", 1);
    await Printer.printLine(`${struk.kontakToko}`, 1);
    await Printer.printLine(`${struk.alamatToko}`, 1);
    await Printer.printLine("--------------------------------");
    await Printer.printLine(Printer.lineLR("Kasir", `${struk.namaAdmin}`));
    await Printer.printLine(Printer.lineLR("Tanggal", Helpers.tanggalSekarang()));
    await Printer.printLine("================================");
  	for (const p of cart) {
  		await Printer.printLine(`${p.namaBarang}`);
      await Printer.printLine(Printer.lineLR(`${Helpers.formatRupiah(p.hargaBarang)} x ${p.jumlahBarang}`, Helpers.formatRupiah(p.subtotal)));
      if (p.diskonHarga > 0) {
      	await Printer.printLine(Printer.lineLR(`Diskon: ${Helpers.formatRupiah(p.diskonHarga)} x ${p.jumlahBarang}`, Helpers.formatRupiah(p.subdiskon)));
      }
  	}
  	await Printer.printLine("--------------------------------");
  	const printSubtotal = cart.reduce((a, b) => a + b.subtotal, 0);
  	const printDiskon = cart.reduce((a, b) => a + b.subdiskon, 0);
  	const printTotal = printSubtotal - printDiskon;
    await Printer.printLine(Printer.lineLR("Subtotal", Helpers.formatRupiah(printSubtotal)));
    await Printer.printLine(Printer.lineLR("Total Diskon", Helpers.formatRupiah(printDiskon)));
    await Printer.printLine(Printer.lineLR("Total Belanja", Helpers.formatRupiah(printTotal)));
  	const printBayar = document.querySelector("#nominalBayar")?.value.replace(/\D/g, "");
  	const printKembali = document.querySelector("#kembalian")?.value;
    await Printer.printLine(Printer.lineLR("Dibayar", printBayar));
    await Printer.printLine(Printer.lineLR("Kembalian", printKembali));
  	await Printer.printLine("================================");
    const terimaKasih = struk.terimaKasih.split(",");
    const terima = terimaKasih[0]?.trim() || "";
    const kasih = terimaKasih[1]?.trim() || "";
    if (kasih) {
  		await Printer.printLine(`${terima}`, 1);
  		await Printer.printLine(`${kasih}`, 1);
    } else {
  		await Printer.printLine(`${terima}`, 1);
    }
    await Printer.printLine("\n\n", 1);
  	Modal.modalInfo({
  	  title: 'Berhasil',
  	  body: 'Struk belanja berhasil dicetak!',
  	  btn: { batal: { text: 'Tutup' } }
  	});
  	resetKeranjangBelanja();
  	return true;
  } catch(err) {
    Modal.modalInfo({
      title: 'Gagal Diproses',
      body: `Gagal cetak struk: ${err}`,
      btn: { batal: { text: 'Tutup' } }
    })
  }
}

// fungsi reset keranjang belanja
function resetKeranjangBelanja() {
  // putuskan hubungan tombol dengan form modal
  	const btnPrint = document.querySelector("[data-modal-oke]");
  	if (btnPrint) {
    	btnPrint.removeAttribute("form");
    	btnPrint.setAttribute("type", "button");
  	}
  hapusDataTransaksiTerakhir();
}

// fungsi edit keranjang
function editKeranjang(i) {
	if (i < 0 || i === undefined) {
		return Modal.modalInfo({
			title: 'Terjadi Kesalahan',
			body: 'Produk yang dipilih tidak valid!',
			btn: { batal: { text: 'Tutup' } }
		});
	}
	const p = cart[i];
	Modal.modalInfo({
		title: `Edit - ${p.namaBarang}`,
		body: `
			<form id="editKeranjang" autocomplete="off">
				<div class="row">
					<label>Jumlah Produk</label>
					<input id="jumlah" inputmode="numeric" value="${Helpers.formatRupiah(p.jumlahBarang)}" placeholder="0">
				</div>
				<div class="row">
					<label>Diskon Harga</label>
					<input id="diskon" inputmode="numeric" value="${p.diskonHarga ? Helpers.formatRupiah(p.diskonHarga) : ""}" placeholder="0">
				</div>
			</form>
		`,
		btn: {
			batal: { text: 'Batal' },
			oke: {
				text: 'Simpan',
				rule: 'edit-data-keranjang',
				target: i
			}
		}
	});
	setTimeout(() => {document.querySelector(".modal-info")?.classList.add("info-form")},0);
	const jumlah = document.querySelector("#editKeranjang #jumlah");
	const diskon = document.querySelector("#editKeranjang #diskon");
	const len = jumlah?.value.length;
	jumlah?.setSelectionRange(len, len);
	jumlah?.focus();
	jumlah?.addEventListener("input", () => {
		jumlah.value = jumlah.value.replace(".", ",");
	});
	diskon?.addEventListener("input", () => {
		diskon.value = Helpers.formatRupiah(diskon.value.replace(/\D/g, ""));
	});
}

// fungsi hapus keranjang
function hapusKeranjang(i) {
  const nama = cart[i].namaBarang;
	Modal.modalInfo({
		title: 'Konfirmasi',
		body: `Hapus produk <b>${nama}</b>?`,
		btn: {
			batal: { text: 'Batal' },
			hapus: {
				text: 'Lanjut Hapus',
				rule: 'hapus-data-keranjang',
				target: i
			}
		}
	});
}

// fungsi modal edit, hapus keranjang
function pilihanEditHapusKeranjang(i, nama) {
	Modal.modalInfo({
		title: 'Konfirmasi',
		body: `Produk <b>${nama}</b>`,
		btn: {
			batal: { text: 'Batal' },
			edit: {
			  text: 'Edit',
			  rule: 'pilih-edit-data-keranjang',
			  target: i
			},
			oke: {
				text: 'Hapus',
				rule: 'pilih-hapus-data-keranjang',
				target: i
			}
		}
	});
}

// fungsi tampilkan keranjang 
function tampilkanKeranjang() {
  const tabelKeranjang = document.querySelector("#tabelKeranjang tbody");
  const transaksiTerakhir = localStorage.getItem("transaksiTerakhir");
	tabelKeranjang.innerHTML = "";
	if (cart.length > 0) {
		cart.forEach((p, i) => {
			tabelKeranjang.innerHTML += `
  			<tr>
  				<td>${i + 1}</td>
  				<td>${p.namaBarang}</td>
  				<td>${p.jumlahBarang.toString().replace(".", ",")}</td>
  				<td>x</td>
  				<td>${Helpers.formatRupiah(p.hargaBarang)}</td>
  				<td>=</td>
  				<td>${Helpers.formatRupiah(p.subtotal)}</td>
  				<td>
  					<button data-title-info="Edit atau hapus keranjang" data-pilihan-edit-hapus-keranjang="${i}" data-nama-barang-keranjang="${p.namaBarang}" type="button" title="Pilihan">
  						<i class="fa-solid fa-ellipsis-vertical"></i>
  					</button>
  				</td>
  			</tr>
			`;
		});
	} else {
	  setTimeout(() => {
  		tabelKeranjang.innerHTML = `
  			<tr class="no-krj">
  				<td>Belum ada transaksi yang tersedia!</td>
  			</tr>
  		`;
	  }, 500);
	}
}

// fungsi hapus data keranjang
function hapusDataKeranjang(target) {
	if (target < 0 || target >= cart.length) {
		return Modal.modalInfo({
			title: "Proses Error",
			body: "Produk tidak valid!",
			btn: { batal: { text: "Tutup" } }
		});
	}
	const [dihapus] = cart.splice(target, 1);
	if (dihapus) {
		simpanTransaksiTerakhir(cart);
		Sound.playDelete();
	} else {
		Modal.modalInfo({
			title: "Proses Gagal",
			body: "Produk gagal dihapus coba lagi!",
			btn: { batal: { text: "Tutup" } }
		});
	}
}

// fungsi edit data keranjang
function editDataKeranjang(target) {
	const inputJumlah = document.querySelector("#editKeranjang #jumlah");
	const inputDiskon = document.querySelector("#editKeranjang #diskon");
	const jumlah = inputJumlah.value;
	const diskon = inputDiskon.value;
	
	if ((isNaN(parseInt(jumlah)) || parseInt(jumlah) <= 0)) {
		setTimeout(() => inputJumlah.focus());
		Install.toast('Masukkan jumlah produk', inputJumlah);
		return false;
	}
	hitungTotal(target, jumlah, diskon);
	simpanTransaksiTerakhir(cart);
	Sound.playUpdate();
	Modal.modalInfo({
	  title: 'Berhasil',
		body: 'Perubahan berhasil disimpan!',
		btn: { batal: { text: 'Tutup' } }
	});
	return true;
}

// fungsi lihat atau perbesar struk
function lihatStruk() {
  if (cart.length === 0) {
    return Modal.modalInfo({
      title: 'Transaksi Kosong',
      body: 'Belum ada transaksi untuk dilihat!',
      btn: { batal: { text: 'Tutup' } }
    });
  }
  const body = document.querySelector("body");
	const tutup = document.querySelector("#tutup");
	const preview = document.querySelector(".box-prev");
	body.classList.add("overhide");
	preview.classList.add("full");
	tutup.classList.add("show");
	tutup.onclick = () => {
	  body.classList.remove("overhide");
		preview.classList.remove("full");
		tutup.classList.remove("show");
	}
}

// fungsi tampilkan struk
function tampilkanStruk() {
	const listProduk = document.querySelector(".produk");
	listProduk.innerHTML = "";
	if (cart.length > 0) {
		cart.forEach((p, i) => {
			listProduk.innerHTML += `
  			<div target-data="${i}" class="item">
  				<span class="n-produk">${p.namaBarang}</span>
  				<div class="flex">
  					<span class="hxj">${Helpers.formatRupiah(p.hargaBarang)} x ${p.jumlahBarang.toString().replace(".", ",")}</span>
  					<span class="sth">${Helpers.formatRupiah(p.subtotal)}</span>
  				</div>
  				<div class="flex">
  					${p.subdiskon != 0 ? `<span>Diskon: ${Helpers.formatRupiah(p.diskonHarga)} x ${p.jumlahBarang.toString().replace(".", ",")}</span>
  					<span>${Helpers.formatRupiah(p.subdiskon)}</span>` : ""}
  				</div>
  			</div>
			`;
		});
		
		const elSubtotal = cart.reduce((a, b) => a + b.subtotal, 0);
		const elDiskon = cart.reduce((a, b) => a + b.subdiskon, 0);
		const elTotal = elSubtotal - elDiskon;
		document.querySelector(".el-subtotal").textContent = Helpers.formatRupiah(elSubtotal);
		document.querySelector(".el-diskon").textContent = Helpers.formatRupiah(elDiskon);
		document.querySelector(".el-total").textContent = Helpers.formatRupiah(elTotal);
	} else {
		listProduk.innerHTML = `
		  <div class="no-list">Struk Belanja</div>
		`;
		document.querySelector(".el-subtotal").textContent = "0";
		document.querySelector(".el-diskon").textContent = "0";
		document.querySelector(".el-total").textContent = "0";
	}
}

// fungsi input transaksi
function inputTransaksi(e) {
	e.preventDefault();
	const inputNamaBarang = document.querySelector("#namaBarang");
	const inputHargaBarang = document.querySelector("#hargaBarang");
	const inputJumlahBarang = document.querySelector("#jumlahBarang");
	const inputDiskonHarga = document.querySelector("#diskonHarga");
	
	if (inputNamaBarang.value.trim() === "") {
		inputNamaBarang.focus();
		Install.toast('Masukkan kode atau nama produk', inputNamaBarang);
		return;
	}
	if (inputHargaBarang.value.trim() === "" || inputHargaBarang.value.trim() === "0") {
		inputHargaBarang.focus();
		Install.toast('Masukkan harga produk', inputHargaBarang);
		return;
	}
	if (inputJumlahBarang.value.trim() === "" || inputJumlahBarang.value.trim() === "0") {
		inputJumlahBarang.focus();
		Install.toast('Masukkan jumlah produk', inputJumlahBarang);
		return;
	}
	
	const namaBarang = inputNamaBarang.value;
	const hargaBarang = Number(inputHargaBarang.value.replace(/\./g, ""));
	const jumlahBarang = Number(inputJumlahBarang.value.replace(",", "."));
	const diskonHarga = Number(inputDiskonHarga.value.replace(/\./, ""));
	// hitung subtotal
	const subtotal = hargaBarang * jumlahBarang;
	const subdiskon = diskonHarga * jumlahBarang;
	// simpan ke keranjang
	cart.push({
		namaBarang,
		hargaBarang,
		jumlahBarang,
		diskonHarga,
		subtotal,
		subdiskon
	});
	simpanTransaksiTerakhir(cart);
	inputNamaBarang.focus();
	Sound.playBell();
	document.querySelector("#formStruk form")?.reset();
}

// fungsi modal pembayaran
function modalPembayaran() {
  Modal.modalInfo({
		title: 'Form Pembayaran',
		body: `
			<form id="formPembayaran" autocomplete="off">
				<div class="row">
					<label>Nominal Bayar</label>
					<input id="nominalBayar" inputmode="numeric">
				</div>
				<div class="row">
					<label>Total Belanja</label>
					<input id="totalBelanja" inputmode="numeric" placeholder="0" readonly>
				</div>
				<div class="row">
					<label>Kembalian</label>
					<input id="kembalian" inputmode="numeric" placeholder="0" readonly>
				</div>
			</form>
		`,
		btn: {
			batal: { text: "Batal" },
			oke: {
				text: `<i class="fa-solid fa-print"></i> Print`,
				rule: 'print-struk-belanja'
			}
		}
	});
	setTimeout(() => {document.querySelector(".modal-info")?.classList.add("info-form")},0);
	// hubungkan tombol dengan form modal
	const btnPrint = document.querySelector("[data-modal-oke]");
	if (btnPrint) {
  	btnPrint.setAttribute("form", "formPembayaran");
  	btnPrint.setAttribute("type", "submit");
	}
	// set kolom input
	const pembayaran = document.querySelector("#nominalBayar");
  const totalBelanja = document.querySelector("#totalBelanja");
  const sisaUang = document.querySelector("#kembalian");
  const subtotal = cart.reduce((a, b) => a + b.subtotal, 0);
  const subdiskon = cart.reduce((a, b) => a + b.subdiskon, 0);
  const total = subtotal - subdiskon;
  // hapus listener lama biar tidak dobel-dobel
  pembayaran?.replaceWith(pembayaran.cloneNode(true));
  const bayarInput = document.querySelector("#nominalBayar");
  totalBelanja.value = Helpers.formatRupiah(total);
  bayarInput?.focus();
  bayarInput?.addEventListener("input", () => {
  	// ambil angka saja
    const angkaBayar = Number(bayarInput?.value.replace(/\D/g, ""));
    // hitung kembalian
    const kmb = angkaBayar - total;
    if (bayarInput.value === "") { bayarInput.value = ""; sisaUang.value = "0"; return; }
    // tampilkan format Rupiah di input pembayaran
    bayarInput.value = Helpers.formatRupiah(angkaBayar);
    // tampilkan kembalian ke layar (format rupiah)
    sisaUang.value = Helpers.formatRupiah(kmb);
  });
}

// fungsi validasi jumlah kosong
function validasiJumlahKosong() {
  const jumpro = document.querySelectorAll(".jumpro");
  let jumlah = "";
	jumpro?.forEach(el => {
	  el.addEventListener("blur", () => {
	    if (el.value.trim() === "" || el.value.trim() === "0") {
	      el.value = "1";
	    }
	  });
    if (el.value.trim() !== "" || el.value.trim() === "0") {
      jumlah = "1";
    }
	});
	return jumlah;
}

// fungsi tutup hasil pencarian
function tutupHasilPencarian(rule) {
  document.querySelector("body")?.classList.remove("overhide");
  document.querySelector(".hasil-pencarian")?.classList.remove("show");
  document.querySelector("#hasilPencarian").innerHTML = "";
  if (rule !== undefined && rule === "clicked") document.querySelector("#formStruk form")?.reset();
  document.querySelector("#formStruk form #namaBarang")?.focus();
}

// fungsi simpan transaksi terakhir
function simpanTransaksiTerakhir(dataTransaksi) {
  localStorage.setItem("transaksiTerakhir", JSON.stringify(dataTransaksi));
  tampilkanStruk();
  tampilkanKeranjang();
}

// fungsi tampilkan transaksi terakhir
function tampilkanTransaksiTerakhir() {
  const saved = localStorage.getItem("transaksiTerakhir");
  if (saved) {
    const dataTransaksi = JSON.parse(saved);
    cart = dataTransaksi;
  }
  tampilkanStruk();
  tampilkanKeranjang();
}

// fungsi hapus transaksi terakhir
function hapusTransaksiTerakhir() {
  if (cart.length === 0) {
    return Modal.modalInfo({
      title: 'Transaksi Kosong',
      body: 'Belum ada transaksi untuk hapus!',
      btn: { batal: { text: 'Tutup' } }
    });
  }
  Modal.modalInfo({
    title: 'Konfirmasi',
    body: 'Hapus transaksi terakhir?',
    btn: {
      batal: { text: 'Batal' },
      hapus: {
        text: 'Hapus',
        rule: 'hapus-data-transaksi-terakhir',
        target: 'clicked'
      }
    }
  });
}

// fungsi hapus datq transaksi terakhir
function hapusDataTransaksiTerakhir(target) {
  localStorage.removeItem("transaksiTerakhir");
  cart.length = 0;
  if (target === "clicked") {
    const transaksiTerakhir = tampilkanTransaksiTerakhir();
    if (transaksiTerakhir === undefined) {
      Modal.modalInfo({
        title: 'Berhasil',
        body: 'Transaksi berhasil dihapus!',
        btn: { batal: { text: 'Tutup' } }
      });
    } else {
      Modal.modalInfo({
        title: 'Gagal',
        body: 'Transaksi gagal dihapus, coba lagi!',
        btn: { batal: { text: 'Tutup' } }
      });
    }
  }
  tampilkanStruk();
  tampilkanKeranjang();
  Sound.playDelete();
}

// fungsi cek data keranjang sebelum proseb pembayaran
function cekDataKeranjang() {
	if (cart.length === 0) {
		return Modal.modalInfo({
			title: 'Transaksi Kosong',
			body: 'Belum ada transaksi untuk diproses!',
			btn: { batal: { text: 'Tutup' } }
		});
	}
	return true;
}

export const Transaksi =  {
	cart,
	tampilkanStruk,
	printStrukBelanja,
	inputTransaksi,
	liveSearchProduk,
	pilihProduk,
	editKeranjang,
	hapusKeranjang,
	editDataKeranjang,
	hapusDataKeranjang,
	lihatStruk,
	modalPembayaran,
	tutupHasilPencarian,
	pilihanEditHapusKeranjang,
	hapusTransaksiTerakhir,
	hapusDataTransaksiTerakhir,
	tampilkanTransaksiTerakhir,
	cekDataKeranjang,
	showButtonInputNamaProduk,
	hideButtonInputNamaProduk
};