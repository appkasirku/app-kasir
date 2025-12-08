import { Helpers } from './helpers.js';
import { Modal } from './modal.js';
import { Sound } from './sound.js';

// fungsi tampilkan data struk ke preview struk toko,kontak,alamat,nama,tk
function tampilkanDataStrukPreviewStruk() {
	const namaToko = document.querySelector(".toko");
	const kontakToko = document.querySelector(".kontak");
	const alamatToko = document.querySelector(".alamat");
	const namaAdmin = document.querySelector(".nama");
	const terimaKasih = document.querySelector(".tk");
	const data = JSON.parse(localStorage.getItem("dataStruk"));
	if (namaToko) namaToko.textContent = data?.namaToko || "Toko Adi Jaya";
	if (kontakToko) kontakToko.textContent = data?.kontakToko || "WhatsApp: 0812 8524 2366";
	if (alamatToko) alamatToko.textContent = data?.alamatToko || "Jl. 20 Desember, Pegadungan, Kalideres, Jakarta Barat";
	if (namaAdmin) namaAdmin.textContent = data?.namaAdmin || "Arnadi";
	if (terimaKasih) terimaKasih.innerHTML = data?.terimaKasih.split(", ").join("<br>") || "Terima Kasih<br>Sudah Berbelanja";
}

// fungsi simpan data toko
function simpanDataStruk(e) {
	e.preventDefault();
	const input = document.querySelectorAll("#dataStruk input");
		const dataStruk = {
		namaToko: input[0].value.trim(),
		kontakToko: input[1].value.trim(),
		alamatToko: input[2].value.trim(),
		namaAdmin: input[3].value.trim(),
		terimaKasih: input[4].value.trim()
	}
	localStorage.setItem("dataStruk", JSON.stringify(dataStruk));
	Sound.playSave();
	tampilkanDataStrukPreviewStruk();
	tutupPengaturanStruk();
	return Modal.modalInfo({
		title: 'Tersimpan',
		body: 'Data struk berhasil disimpan!',
		btn: { batal: { text: 'Tutup' } }
	});
}

// fungsi muat data struk
function muatDataStruk() {
	const data = JSON.parse(localStorage.getItem("dataStruk"));
	if (!data) return;
	const input = document.querySelectorAll("#dataStruk input");
	input[0].value = data.namaToko || "";
	input[1].value = data.kontakToko || "";
	input[2].value = data.alamatToko || "";
	input[3].value = data.namaAdmin || "";
	input[4].value = data.terimaKasih || "";
}

function elementOnInput() {
  document.querySelectorAll("form#dataStruk input")?.forEach(el => {
    el.addEventListener("input", (e) => {
      el.value = Helpers.capitalizeWords(el.value);
    });
  });
}

// fungsi buka pengaturan data struk
function bukaPengaturanStruk() {
	document.querySelector(".setting-box").classList.add("show");
	document.querySelector("body").classList.add("overhide");
	muatDataStruk();
	elementOnInput();
}

// fungsi tutup pengaturan data struk
function tutupPengaturanStruk() {
	document.querySelector(".setting-box").classList.remove("show");
	document.querySelector("body").classList.remove("overhide");
}

export const Struk = {
	simpanDataStruk,
	muatDataStruk,
	bukaPengaturanStruk,
	tutupPengaturanStruk,
	tampilkanDataStrukPreviewStruk
};