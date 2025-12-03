import { Modal } from './modal.js';
import { Sound } from './sound.js';

// fungsi tampilkan data toko ke preview struk toko,kontak,alamat,nama,tk
function tampilkanDataTokoPreviewStruk() {
	const namaTokoJudul = document.querySelector(".nama-toko");
	const namaToko = document.querySelector(".toko");
	const kontakToko = document.querySelector(".kontak");
	const alamatToko = document.querySelector(".alamat");
	const namaAdmin = document.querySelector(".nama");
	const terimaKasih = document.querySelector(".tk");
	const data = JSON.parse(localStorage.getItem("dataToko"));
	if (namaTokoJudul) namaTokoJudul.textContent = data?.namaToko ? `- ${data.namaToko}` : "";
	if (namaToko) namaToko.textContent = data?.namaToko || "Struk Belanja";
	if (kontakToko) kontakToko.textContent = data?.kontakToko;
	if (alamatToko) alamatToko.textContent = data?.alamatToko;
	if (namaAdmin) namaAdmin.textContent = data?.namaAdmin || "Admin";
	if (terimaKasih) terimaKasih.innerHTML = data?.terimaKasih.split(", ").join("<br>") || "Terima Kasih";
}

// fungsi simpan data toko
function simpanDataToko(e) {
	e.preventDefault();
	const input = document.querySelectorAll("#dataToko input");
		const dataToko = {
		namaToko: input[0].value.trim(),
		kontakToko: input[1].value.trim(),
		alamatToko: input[2].value.trim(),
		namaAdmin: input[3].value.trim(),
		terimaKasih: input[4].value.trim()
	}
	localStorage.setItem("dataToko", JSON.stringify(dataToko));
	Sound.playSave();
	tampilkanDataTokoPreviewStruk();
	tutupPengaturanToko();
	return Modal.modalInfo({
		title: 'Tersimpan',
		body: 'Data toko berhasil disimpan!',
		btn: { close: { text: 'Tutup' } }
	});
}

// fungsi muat data toko
function muatDataToko() {
	const data = JSON.parse(localStorage.getItem("dataToko"));
	if (!data) return;
	const input = document.querySelectorAll("#dataToko input");
	input[0].value = data.namaToko || "";
	input[1].value = data.kontakToko || "";
	input[2].value = data.alamatToko || "";
	input[3].value = data.namaAdmin || "";
	input[4].value = data.terimaKasih || "";
}

// fungsi buka pengaturan data toko
function bukaPengaturanToko() {
	document.querySelector(".setting-box").classList.add("show");
	muatDataToko();
}

// fungsi tutup pengaturan data toko
function tutupPengaturanToko() {
	document.querySelector(".setting-box").classList.remove("show");
}

export const Toko = {
	simpanDataToko,
	muatDataToko,
	bukaPengaturanToko,
	tutupPengaturanToko,
	tampilkanDataTokoPreviewStruk
};
