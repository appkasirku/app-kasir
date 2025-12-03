// import fungsi yang dibutuhkan
import { Modal } from './modal.js';
import { Helpers } from './helpers.js';
import { Sound } from './sound.js';

// fungsi validasi input produk
function validasiInputProduk() {
	document.querySelector("#formProduk")?.addEventListener("input", (e) => {
		const el = e.target;
		if (el.id === "inputFormNama") {
			el.value = Helpers.inputFormatNama(el);
		}
		if (el.id === "inputFormUkuran") {
			el.value = Helpers.inputFormatBerat(el);
		}
		if (el.id === "inputFormKode") {
			el.value = Helpers.inputFormatKode(el);
		}
		if (el.id === "inputFormHarga") {
			el.value = Helpers.inputFormatHarga(el);
		}
	});
}

// fungsi edit produk
function editProduk(kode) {
	const daftarProduk = JSON.parse(localStorage.getItem("dataProduk")) || [];
  // Cari produk berdasarkan kode
  const produk = daftarProduk.find(p => p.kodeProduk === kode);
  if (!produk) {
    return Modal.modalInfo({
    	title: 'Produk Tidak Valid',
    	body: `Produk dengan kode <b>${kode}</b> tidak tersedia!`,
    	btn: { close: { text: 'Tutup' } }
    });
  }
  // Masukkan data ke form input
  const input = document.querySelectorAll("#formProduk input");
  input[0].focus();
  input[0].value = produk.namaProduk;
  input[1].value = produk.beratProduk;
  input[2].value = produk.kodeProduk;
  input[3].value = produk.hargaProduk;
  // Simpan kode yang sedang diedit (untuk update nanti)
  localStorage.setItem("produkSedangDiedit", kode);
}

// fungsi hapus produk
function hapusProduk(kode) {
	const daftarProduk = JSON.parse(localStorage.getItem("dataProduk")) || [];
	const produk = daftarProduk.find(p => p.kodeProduk === kode);
	if (!produk) {
		return Modal.modalInfo({
			title: 'Gagal Dihapus',
			body: `Produk dengan kode <b>${kode}</b> tidak tersedia!`,
			btn: { close: { text: 'Tutup' } }
		});
	}
	return Modal.modalInfo({
		title: 'Konfirmasi',
		body: `Produk ${kode ? `<b>${produk.namaProduk}</b>` : '<b>tanpa kode</b>'} akan dihapus dari daftar.`,
		btn: {
			close: { text: 'Batal' },
			oke: {
				text: 'Hapus',
				rule: 'hapus-data-produk',
				target: kode
			}
		}
	});
}

// fungsi hapus data produk
function hapusDataProduk(kode) {
	const daftarProduk = JSON.parse(localStorage.getItem("dataProduk")) || [];
	const index = daftarProduk.findIndex(p => p.kodeProduk === kode);
	const produk = daftarProduk.find(p => p.kodeProduk === kode);
	if (index === -1) {
		return Modal.modalInfo({
			title: 'Gagal Diproses!',
			body: `Produk ${produk.namaProduk} gagal dihapus!`,
			btn: { close: { text: 'Tutup' } }
		});
	}
	daftarProduk.splice(index, 1);
	localStorage.setItem("dataProduk", JSON.stringify(daftarProduk));
	tampilkanDaftarProduk();
	Modal.modalInfo({
		title: 'Proses Berhasil',
		body: `${produk.namaProduk ? `<b>${produk.namaProduk}</b> berhasil dihapus dari daftar produk!` : 'Produk berhasil dihapus!'}`,
		btn: { close: { text: 'Tutup' } }
	});
	Sound.playDelete();
}

// fungsi tampilkan daftar produk
function tampilkanDaftarProduk() {
	let daftarProduk = JSON.parse(localStorage.getItem("dataProduk"));
	const tampilkanDaftarProduk = document.querySelector("#tampilkanDaftarProduk");
	tampilkanDaftarProduk.innerHTML = "";
	if (daftarProduk !== null && daftarProduk.length > 0) {
		daftarProduk.slice().reverse().forEach((p) => {
			tampilkanDaftarProduk.innerHTML += `
			<li>
				<div class="flex">
					<div>
						<span class="kdp">${p.kodeProduk}</span>
						<span class="ktp">${p.namaProduk} ${p.beratProduk}, Rp ${p.hargaProduk}</span>
					</div>
					<div class="btn-action">
						<button data-edit="${p.kodeProduk}" type="button" title="Edit" class="btn-edit">
							<i class="fa-solid fa-edit"></i>
						</button>
						<button data-hapus="${p.kodeProduk}" type="button" title="Hapus" class="btn-hapus">
							<i class="fa-solid fa-trash"></i>
						</button>
					</div>
				</div>
			</li>
			`;
		});
	} else {
		tampilkanDaftarProduk.innerHTML = `
		<li class="ctr">Belum ada produk yang tersedia!</li>
		`;
	}
}

// fungsi validasi form produk
function validasiFormProduk(el) {
  for (const input of el) {
  	if (input.value.trim() === "") {
  		input.focus();
  		return false;
  	}
  }
  return true;
}

// fungsi simpan form produk
function simpanFormProduk(e) {
  e.preventDefault();
  const input = document.querySelectorAll("#formProduk input");
  const nama = input[0].value.trim();
  const berat = input[1].value.trim();
  const kode = input[2].value.trim();
  const harga = input[3].value.trim();
  if (input[0].value.trim() === "") {
  	input[0].focus();
  	return;
  } else if (input[1].value.trim() === "") {
  	input[1].focus();
  	return;
  } else if (input[2].value.trim() === "") {
  	input[2].focus();
  	return;
  } else if (input[3].value.trim() === "") {
  	input[3].focus();
  	return;
  }
  const daftarProduk = JSON.parse(localStorage.getItem("dataProduk")) || [];
  const kodeEdit = localStorage.getItem("produkSedangDiedit");
  if (kodeEdit) {
  	// MODE EDIT
  	const index = daftarProduk.findIndex(p => p.kodeProduk === kodeEdit);
  	if (index !== -1) {
      daftarProduk[index] = {
        namaProduk: nama,
        beratProduk: berat,
        kodeProduk: kode,
        hargaProduk: harga,
      };
  	}
    localStorage.removeItem("produkSedangDiedit");
  } else {
    // MODE TAMBAH
    daftarProduk.push({
      namaProduk: nama,
      beratProduk: berat,
      kodeProduk: kode,
      hargaProduk: harga,
    });
  }
  localStorage.setItem("dataProduk", JSON.stringify(daftarProduk));
	document.querySelector("#formProduk").reset();
	input[3].blur();
	tampilkanDaftarProduk();
	if (kodeEdit) {
		Sound.playUpdate();
	} else {
  	Sound.playSave();
	}
}

// fungsi buka form produk
function bukaFormProduk() {
	document.querySelector(".input-produk").classList.add("show");
	tampilkanDaftarProduk();
}

// fungsi tutup form produk
function tutupFormProduk() {
	document.querySelector(".input-produk").classList.remove("show");
	const formProduk = document.querySelector("#formProduk");
	if (!formProduk) return;
	formProduk.reset();
}

export const Produk = {
	editProduk,
	hapusProduk,
	hapusDataProduk,
	bukaFormProduk,
	simpanFormProduk,
	tutupFormProduk,
	validasiInputProduk,
};