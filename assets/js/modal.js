// import fun yang dibutuhkan
import { Helpers } from './helpers.js';
import { Transaksi } from './transaction.js';
import { Produk } from './product.js';

// fungsi modal info
function modalInfo(data) {
	const body = document.querySelector("body");
	const modalEl = document.createElement("div");
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
				${data.btn.close ? `<button data-modal-close data-rule="${data.btn.close.rule}" type="button" title="${Helpers.stripHTML(data.btn.close.text)}">${data.btn.close.text}</button>` : ""}
				${data.btn.oke ? `<button data-modal-oke data-rule="${data.btn.oke.rule}" data-target="${data.btn.oke.target}" type="button" title="${Helpers.stripHTML(data.btn.oke.text)}" class="oke">${data.btn.oke.text}</button>` : ""}
			</div>
		</div>
	`;
	body.appendChild(modalEl);
	modalEl.innerHTML = modalHtml;
	document.querySelector("#bukaFormProduk").style.display = "none";
}

// fungsi aksi modal info
async function aksiModal(rule, target) {
	if (rule === "simpan-data-keranjang" && target !== undefined) {
		simpanDataKeranjang(target);
		tutupModalInfo();
	} else if (rule === "simpan-data-produk" && target !== undefined) {
		simpanDataProduk(target);
		tutupModalInfo();
	} else if (rule === "hapus-data-keranjang" && target !== undefined) {
		Transaksi.hapusDataKeranjang(target);
		tutupModalInfo();
	} else if (rule === "hapus-data-produk" && target !== undefined) {
		Produk.hapusDataProduk(target);
		tutupModalInfo();
	} else if (rule === "edit-data-keranjang" && target !== undefined) {
		if (!Transaksi.editDataKeranjang(target)) return;
		tutupModalInfo();
	} else if (rule === "edit-data-produk" && target !== undefined) {
		editDataProduk(target);
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

// fungsi tutuo modal info
function tutupModalInfo() {
	const modalEl = document.querySelector(".modal-info");
	if (modalEl) {
		modalEl.classList.remove("info-form");
		modalEl.remove();
	}
	document.querySelector("#bukaFormProduk").style.display = "flex";
}

// event klik pada tombol oke
document.addEventListener("click", (e) => {
	if (e.target.matches("[data-modal-oke")) {
		const rule = e.target.dataset.rule;
		const target = e.target.dataset.target;
		aksiModal(rule, target);
	}
});

// event klik pada tombol close
document.addEventListener("click", (e) => {
	if (e.target.matches("[data-modal-close")) {
		const rule = e.target.dataset.rule;
		const target = e.target.dataset.target;
		aksiModal(rule, null);
	}
});

export const Modal = {
	modalInfo,
	tutupModalInfo
};