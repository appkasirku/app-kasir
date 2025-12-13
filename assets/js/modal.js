// import fun yang dibutuhkan
import { Helpers } from './helpers.js';
import { Transaksi } from './transaction.js';
import { Produk } from './product.js';

// fungsi modal info
function modalInfo(data) {
	const body = document.querySelector("body");
	const modalEl = document.createElement("div");
	body.classList.remove("overhide");
	modalEl.classList.add("modal-info");
	const modalHtml = `
		<div class="modal-content">
			<div class="modal-header">
				<h3>${data.title ?? "App Kasir"}</h3>
			</div>
			<div class="modal-body">
				<div>${data.body ?? "(-_-)"}</div>
			</div>
			<div class="modal-footer">
				${data.btn.batal ? `<button data-title-info="Tutup modal" data-modal-batal data-rule="${data.btn.batal.rule}" type="button" title="${Helpers.stripHTML(data.btn.batal.text)}">${data.btn.batal.text}</button>` : ""}
				${data.btn.edit ? `<button data-title-info="Edit data" data-modal-edit data-rule="${data.btn.edit.rule}" data-target="${data.btn.edit.target}" type="button" title="${Helpers.stripHTML(data.btn.edit.text)}" class="edit">${data.btn.edit.text}</button>` : ""}
				${data.btn.hapus ? `<button data-title-info="Hapus data" data-modal-hapus data-rule="${data.btn.hapus.rule}" data-target="${data.btn.hapus.target}" type="button" title="${Helpers.stripHTML(data.btn.hapus.text)}" class="hapus">${data.btn.hapus.text}</button>` : ""}
				${data.btn.oke ? `<button data-title-info="Lanjutkan ${Helpers.stripHTML(data.btn.oke.text.toLowerCase())}" data-modal-oke data-rule="${data.btn.oke.rule}" data-target="${data.btn.oke.target}" type="button" title="${Helpers.stripHTML(data.btn.oke.text)}" class="oke">${data.btn.oke.text}</button>` : ""}
			</div>
		</div>
	`;
	body.appendChild(modalEl);
	modalEl.innerHTML = modalHtml;
	body.classList.add("overhide");
	Helpers.tampilkanInfoTombol();
}

// fungsi aksi modal info
async function aksiModal(rule, target) {
	if (rule === "simpan-data-keranjang" && target !== undefined) {
		simpanDataKeranjang(target);
		tutupModalInfo();
	} else if (rule === "simpan-data-produk" && target !== undefined) {
		simpanDataProduk(target);
		tutupModalInfo();
	} else if (rule === "pilih-hapus-data-keranjang" && target !== undefined) {
	  Transaksi.hapusKeranjang(target);
	  tutupModalInfo();
	} else if (rule === "hapus-data-keranjang" && target !== undefined) {
		Transaksi.hapusDataKeranjang(target);
		tutupModalInfo();
	} else if(rule === "hapus-data-transaksi-terakhir" && target !== undefined) {
	  Transaksi.hapusDataTransaksiTerakhir(target);
	  tutupModalInfo();
	} else if (rule === "pilih-hapus-data-produk" && target !== undefined) {
		Produk.hapusProduk(target);
		tutupModalInfo();
	} else if (rule === "hapus-data-produk" && target !== undefined) {
		Produk.hapusDataProduk(target);
		tutupModalInfo();
	} else if (rule === "pilih-edit-data-keranjang" && target !== undefined) {
	  Transaksi.editKeranjang(target);
	  tutupModalInfo();
	} else if (rule === "edit-data-keranjang" && target !== undefined) {
		if (!Transaksi.editDataKeranjang(target)) return;
		tutupModalInfo();
	} else if (rule === "pilih-edit-data-produk" && target !== undefined) {
		Produk.editProduk(target);
		tutupModalInfo();
	} else if (rule === 'ubah-kode-produk') {
	  Produk.ubahKodeProduk();
	  tutupModalInfo();
	} else if (rule === "print-struk-belanja") {
	  const hasil = await Transaksi.printStrukBelanja();
		if (!hasil) return;
		tutupModalInfo();
	} else if (rule === "muat-ulang-halaman") {
		muatUlangHalaman();
		tutupModalInfo();
	} else {
		tutupModalInfo();
	}
}

// fungsi tutup modal info
function tutupModalInfo() {
	const modalEl = document.querySelector(".modal-info");
	if (modalEl) {
		modalEl.classList.remove("info-form");
		modalEl.remove();
	}
	document.querySelector("body")?.classList.remove("overhide");
}

// even klik tombol modal
document.addEventListener("click", (e) => {
  e.preventDefault();
  // tombol modal tutup
	if (e.target.matches("[data-modal-batal]")) {
		const rule = e.target.dataset.rule;
		const target = e.target.dataset.target;
		aksiModal(rule, null);
	}
  // tombol modal edit
	if (e.target.matches("[data-modal-edit]")) {
		const rule = e.target.dataset.rule;
		const target = e.target.dataset.target;
		aksiModal(rule, target);
	}
  // tombol modal hapus
	if (e.target.matches("[data-modal-hapus]")) {
		const rule = e.target.dataset.rule;
		const target = e.target.dataset.target;
		aksiModal(rule, target);
	}
  // tombol modal oke
	if (e.target.matches("[data-modal-oke]")) {
		const rule = e.target.dataset.rule;
		const target = e.target.dataset.target;
		aksiModal(rule, target);
	}
});

export const Modal = {
	modalInfo,
	tutupModalInfo
};