// import fungsi yang dibutuhkan
import { Install } from './install.js';
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
			if (el.value === "0") {
			  el.value = "";
			}
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
    	btn: { batal: { text: 'Tutup' } }
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

// fungsi ubah kode produk
function ubahKodeProduk() {
  document.querySelector("#formProduk #inputFormKode")?.focus();
}

// fungsi hapus produk
function hapusProduk(kode) {
	const daftarProduk = JSON.parse(localStorage.getItem("dataProduk")) || [];
	const produk = daftarProduk.find(p => p.kodeProduk === kode);
	if (!produk) {
		return Modal.modalInfo({
			title: 'Gagal Dihapus',
			body: `Produk dengan kode <b>${kode}</b> tidak tersedia!`,
			btn: { batal: { text: 'Tutup' } }
		});
	}
  Modal.modalInfo({
		title: 'Konfirmasi',
		body: `Hapus produk <b>${produk.namaProduk} ${produk.beratProduk}</b>?`,
		btn: {
			batal: { text: 'Batal' },
			hapus: {
				text: 'Lanjut Hapus',
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
			btn: { batal: { text: 'Tutup' } }
		});
	}
	daftarProduk.splice(index, 1);
	localStorage.setItem("dataProduk", JSON.stringify(daftarProduk));
	tampilkanDaftarProduk();
	Modal.modalInfo({
		title: 'Proses Berhasil',
		body: `${produk.namaProduk ? `<b>${produk.namaProduk}</b> berhasil dihapus dari daftar produk!` : 'Produk berhasil dihapus!'}`,
		btn: { batal: { text: 'Tutup' } }
	});
	Sound.playDelete();
}

// fungsi pilih edit, hapus data produk
function pilihanEditHapusProduk(kode) {
  const daftarProduk = JSON.parse(localStorage.getItem("dataProduk")) || [];
  // Cari produk berdasarkan kode
  const produk = daftarProduk.find(p => p.kodeProduk === kode);
  if (!produk) {
    return Modal.modalInfo({
    	title: 'Produk Tidak Valid',
    	body: `Produk dengan kode <b>${kode}</b> tidak tersedia!`,
    	btn: { batal: { text: 'Tutup' } }
    });
  }
  Modal.modalInfo({
    title: 'Konfirmasi',
    body: `Produk <b>${produk.namaProduk} ${produk.beratProduk}</b>`,
    btn: {
      batal: { text: 'Batal' },
      edit: {
        text: 'Edit',
        rule: 'pilih-edit-data-produk',
        target: kode
      },
      oke: {
        text: 'Hapus',
        rule: 'pilih-hapus-data-produk',
        target: kode
      }
    }
  });
}

// fungsi tampilkan daftar produk
function tampilkanDaftarProduk() {
	let daftarProduk = JSON.parse(localStorage.getItem("dataProduk"));
	const tampilkanDaftarProduk = document.querySelector("#tampilkanDaftarProduk");
	tampilkanDaftarProduk.innerHTML = "";
	if (daftarProduk !== null && daftarProduk.length > 0) {
		daftarProduk.slice().reverse().forEach((p, i) => {
			tampilkanDaftarProduk.innerHTML += `
  			<li>
  				<div class="flex">
  				  <div class="number">
  				    <span>${i + 1}</span>
  				  </div>
  					<div class="produk">
  						<span class="kdp">${p.kodeProduk}</span> &gt;
  						<span class="ktp">${p.namaProduk} ${p.beratProduk} &gt; Rp ${p.hargaProduk}</span>
  					</div>
  					<div class="btn-action">
  						<button data-title-info="Edit atau hapus produk" data-pilihan-edit-hapus-produk="${p.kodeProduk}" type="button" title="Hapus">
  							<i class="fa-solid fa-ellipsis-vertical"></i>
  						</button>
  					</div>
  				</div>
  			</li>
			`;
		});
		Helpers.tampilkanInfoTombol();
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
  	Install.toast('Masukkan nama/merek produk', input[0]);
  	return;
  } else if (input[1].value.trim() === "") {
  	input[1].focus();
  	Install.toast('Masukkan ukuran produk', input[1]);
  	return;
  } else if (input[2].value.trim() === "") {
  	input[2].focus();
  	Install.toast('Masukkan kode produk', input[2]);
  	return;
  } else if (input[3].value.trim() === "") {
  	input[3].focus();
  	Install.toast('Masukkan harga jual produk', input[3]);
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
    const kodeIndex = daftarProduk.findIndex(p => p.kodeProduk === kode);
    if (kodeIndex === -1 ) {
      daftarProduk.push({
        namaProduk: nama,
        beratProduk: berat,
        kodeProduk: kode,
        hargaProduk: harga,
      });
    } else {
      return Modal.modalInfo({
        title: 'Duplikat Produk',
        body: `Produk dengan kode <b>${kode}</b> sudah ada di tabel.`,
        btn: {
          edit: {
            text: 'Ubah Kode',
            rule: 'ubah-kode-produk'
          },
          oke: {
            text: 'Perbarui',
            rule: 'pilih-edit-data-produk',
            target: kode
          }
        }
      });
    }
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

// fungsi reset form produk
function resetFormProduk() {
  document.querySelector("#formProduk")?.reset();
  const kodeEdit = localStorage.getItem("produkSedangDiedit");
  if (kodeEdit) {
    localStorage.removeItem("produkSedangDiedit");
  }
}

// fungsi buka form produk
function bukaFormProduk() {
	document.querySelector("body").classList.add("overhide");
	document.querySelector(".input-produk").classList.add("show");
	tampilkanDaftarProduk();
	const kodeEdit = localStorage.getItem("produkSedangDiedit");
  if (kodeEdit) {
    localStorage.removeItem("produkSedangDiedit");
  }
}

// fungsi tutup form produk
function tutupFormProduk() {
	document.querySelector("body")?.classList.remove("overhide");
	document.querySelector(".input-produk")?.classList.remove("show");
	resetFormProduk();
}

export const Produk = {
	bukaFormProduk,
	tutupFormProduk,
	resetFormProduk,
	editProduk,
	ubahKodeProduk,
	hapusProduk,
	hapusDataProduk,
	simpanFormProduk,
	validasiInputProduk,
	pilihanEditHapusProduk
};