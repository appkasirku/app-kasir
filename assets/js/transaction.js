import { Modal } from './modal.js';
import { Sound } from './sound.js';
import { Helpers } from './helpers.js';
import { Printer } from './printer.js';

// fungsi hitung total
function hitungTotal(target, jumlah, diskon) {
	jumlah = jumlah.replace(",", ".");
	diskon = diskon.replace(/\./g, "");
	const subdis = diskon * jumlah;
	const subtot = cart[target].hargaBarang * jumlah;
	//const 
	cart[target].jumlahBarang = jumlah;
	cart[target].diskonHarga = diskon;
	cart[target].subtotal = subtot;
	cart[target].subdiskon = subdis;
}

// fungsi pilih produk hasil pencarian
function pilihProduk(kode, rule) {
	const daftarProduk = JSON.parse(localStorage.getItem("dataProduk")) || [];
	const produk = daftarProduk.find(p => p.kodeProduk === kode);
	if (produk) {
		const elNama = document.querySelector("#namaBarang");
		const elHarga = document.querySelector("#hargaBarang");
		const elJumlah = document.querySelector("#jumlahBarang");
		document.querySelector(".hasil-pencarian").classList.remove("show");
		elNama.value = `${produk.namaProduk} ${produk.beratProduk}`;
		elHarga.value = produk.hargaProduk;
		if (rule !== "" || rule === "addpro") {
			elJumlah.value = 1;
			const namaBarang = document.querySelector("#namaBarang").value;
			const hargaBarang = Number(document.querySelector("#hargaBarang").value.replace(/\./g, ""));
			const jumlahBarang = Number(document.querySelector("#jumlahBarang").value.replace(",", "."));
			const diskonHarga = Number(document.querySelector("#diskonHarga").value.replace(/\./, ""));
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
			tampilkanStruk();
			tampilkanKeranjang();
			document.querySelector("#formStruk form").reset();
			elNama.focus();
			Sound.playBell();
		} else {
			elJumlah.focus();
		}
	} else {
		const elNama = document.querySelector("#namaBarang");
		elNama.focus();
		elNama.value = kode;
	}
}

// fungsi pencarian live produk
function liveSearchProduk(el) {
	const hasilPencarian = document.querySelector(".hasil-pencarian");
	const listProduk = document.querySelector("#hasilPencarian");
	const daftarProduk = JSON.parse(localStorage.getItem("dataProduk")) || [];
	const hasil = daftarProduk.filter(p => p.kodeProduk.toLowerCase().includes(el.value.toLowerCase()) || p.namaProduk.toLowerCase().includes(el.value.toLowerCase()));
	hasilPencarian.classList.add("show");
	listProduk.innerHTML = hasil.map(p => 
	`
		<li>
			<span data-target-kode="${p.kodeProduk}" data-target-rule="" class="nama-produk">
				${p.namaProduk} ${p.beratProduk}
			</span>
			<span data-target-kode="${p.kodeProduk}" data-target-rule="addpro" class="btn-plus">
				<i class="fa-solid fa-plus"></i>
			</span>
		</li>
	`).join("");
	if (el.value.trim() === "") {
		document.querySelector("#formStruk form").reset();
	}
	if (el.value.trim() === "" || hasil.length === 0) {
		hasilPencarian.classList.remove("show");
		listProduk.innerHTML = "";
	}
}

// fungsi print struk belanja
async function printStrukBelanja() {
  try {
  	const bayar = document.querySelector("#nominalBayar");
  	if (!bayar?.value.trim()) {
  		bayar.focus();
  		return false;
  	}
  	/*
  	modalInfo({
  		title: 'Proses Berhasil',
  		body: 'Struk belanja berhasil diprint!',
  		btn: { oke: { text: 'Oke' } }
  	});
  	*/
  	//if (!Printer.cekKoneksiPrinter()) return;
  	//alert('lanjut')
  	
  	//if (!Printer.printerCharacteristic) {
    	//document.querySelector(".form-struk").classList.add("hidden");
    	//alert("Printer belum terhubung!\n\nSilakan SCAN SERVICES => Hubungkan Printer.");
    	/*
    	return Modal.modalInfo({
    		title: 'Hubungkan Printer',
    		body: 'Hubungkan <b>App Kasir</b> dengan <b>Printer</b> (aktifkan Bluetooth &amp; Lokasi).',
    		btn: {
    			close: { text: 'Batal' },
    			oke: {
    				text: 'Hubungkan',
    				rule: 'hubungkan-printer'
    			}
    		}
    	});*/
    //}
    
    const toko = JSON.parse(localStorage.getItem("dataToko")) || [];
      
    //await Printer.printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x40])); // reset printer
    
    await Printer.printStyled(`${toko.namaToko}`, 1, 0x12);
    
    await Printer.printLine("\n", 1);
    
    await Printer.printLine(`${toko.kontakToko}`, 1);
    await Printer.printLine(`${toko.alamatToko}`, 1);
    
    await Printer.printLine("--------------------------------");
      
    await Printer.printLine(Printer.lineLR("Kasir", `${toko.namaAdmin}`));
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
  		
  	const printBayar = document.querySelector("#nominalBayar")?.value;
  	const printKembali = document.querySelector("#kembalian")?.value;
  	
    await Printer.printLine(Printer.lineLR("Dibayar", printBayar));
    await Printer.printLine(Printer.lineLR("Kembalian", printKembali));
     
  	await Printer.printLine("================================");
  	
    const terimaKasih = toko.terimaKasih.split(",");
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
  	  btn: { close: { text: 'Tutup' } }
  	});
  	
  	resetKeranjangBelanja();
  	
  	return true;
  } catch(err) {
    Modal.modalInfo({
      title: 'Gagal Diproses',
      body: `Gagal cetak struk: ${err}`,
      btn: { close: { text: 'Tutup' } }
    })
  }
}

// fungsi reset keranjang belanja
function resetKeranjangBelanja() {
  cart.length = 0;
  tampilkanStruk();
  tampilkanKeranjang();
}

// fungsi edit keranjang
function editKeranjang(i) {
	if (i < 0 || i === undefined) {
		return Modal.modalInfo({
			title: 'Terjadi Kesalahan',
			body: 'Produk yang dipilih tidak valid!',
			btn: { close: { text: 'Tutup' } }
		});
	}
	const p = cart[i];
	Modal.modalInfo({
		title: `Edit - ${p.namaBarang}`,
		body: `
			<form id="editKeranjang">
				<div class="row">
					<label>Jumlah Produk</label>
					<input id="jumlah" inputmode="numeric" value="${p.jumlahBarang}">
				</div>
				<div class="row">
					<label>Diskon Harga</label>
					<input id="diskon" inputmode="numeric" value="${p.diskonHarga}">
				</div>
			</form>
		`,
		btn: {
			close: { text: 'Batal' },
			oke: {
				text: '<i class="fa-solid fa-save"></i> Simpan',
				rule: 'edit-data-keranjang',
				target: i
			}
		}
	});
	document.querySelector(".modal-info").classList.add("info-form");
	const jumlah = document.querySelector("#editKeranjang #jumlah");
	const diskon = document.querySelector("#editKeranjang #diskon");
	jumlah.addEventListener("input", () => {
		jumlah.value = jumlah.value.replace(".", ",");
	});
	diskon.addEventListener("input", () => {
		diskon.value = Helpers.formatRupiah(diskon.value.replace(/\D/g, ""));
	});
}

// fungsi hapus keranjang
function hapusKeranjang(i, nama) {
	Modal.modalInfo({
		title: 'Konfirmasi',
		body: `Hapus produk <b>${nama}</b>?`,
		btn: {
			close: { text: 'Batal' },
			oke: {
				text: 'Hapus',
				rule: 'hapus-data-keranjang',
				target: i
			}
		}
	});
}

// fungsi tampilkan keranjang 
const tabelKeranjang = document.querySelector("#tabelKeranjang tbody");
function tampilkanKeranjang() {
	tabelKeranjang.innerHTML = "";
	if (cart.length > 0) {
		cart.forEach((p, i) => {
			tabelKeranjang.innerHTML += `
  			<tr>
  				<td>${i + 1}</td>
  				<td>${p.namaBarang}</td>
  				<td>${p.jumlahBarang.toString().replace(".", ",")} x ${Helpers.formatRupiah(p.hargaBarang)} = ${Helpers.formatRupiah(p.subtotal)}</td>
  				<td>
  					<button data-edit-keranjang="${i}" data-nama-barang-keranjang="${p.namaBarang}" type="button" title="Edit">
  						<i class="fa-solid fa-pencil"></i>
  					</button>
  					<button data-hapus-keranjang="${i}" data-nama-barang-keranjang="${p.namaBarang}" type="button" title="Hapus">
  						<i class="fa-solid fa-trash"></i>
  					</button>
  				</td>
  			</tr>
			`;
		});
	} else {
		tabelKeranjang.innerHTML = `
			<tr>
				<td class="no-krj">Belum Ada Transaksi di Daftar Belanja</td>
			</tr>
		`;
	}
}

// fungsi hapus data keranjang
function hapusDataKeranjang(target) {
	if (target < 0 || target >= cart.length) {
		return Modal.modalInfo({
			title: "Proses Error",
			body: "Produk tidak valid!",
			btn: { close: { text: "Tutup" } }
		});
	}
	const [dihapus] = cart.splice(target, 1);
	if (dihapus) {/*
		modalInfo({
			title: "Proses Sukses",
			body: "Produk berhasil dihapus!",
			btn: { oke: { text: "Oke" } }
		});*/
		tampilkanStruk();
		tampilkanKeranjang();
		Sound.playDelete();
	} else {
		Modal.modalInfo({
			title: "Proses Gagal",
			body: "Produk gagal dihapus coba lagi!",
			btn: { close: { text: "Tutup" } }
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
		return false;
	}
	hitungTotal(target, jumlah, diskon);
	tampilkanStruk();
	tampilkanKeranjang();/*
	Modal.modalInfo({
		body: 'Perubahan berhasil disimpan!',
		btn: { close: { text: 'Tutup' } }
	});*/
	Sound.playUpdate();
	return true;
}

// fungsi lihat atau perbesar struk
function lihatStruk() {
  if (cart.length === 0) {
    return Modal.modalInfo({
      title: 'Transaksi Kosong',
      body: 'Belum ada transaksi untuk dilihat!',
      btn: { close: { text: 'Tutup' } }
    });
  }
	const tutup = document.getElementById("tutup");
	const preview = document.querySelector(".box-prev");
	preview.classList.toggle("full");
	tutup.classList.toggle("show");
	tutup.onclick = () => {
		preview.classList.toggle("full");
		tutup.classList.toggle("show");
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
		  <div style="padding:4px;text-align:center;color:#aaa;font-weight:bold">Struk Belanja</div>
		`;
		document.querySelector(".el-subtotal").textContent = "0";
		document.querySelector(".el-diskon").textContent = "0";
		document.querySelector(".el-total").textContent = "0";
	}
}

// hapus produk dari array cart dan perbarui tampilan struk
document.querySelector(".produk")?.addEventListener("click", (e) => {
	const item = e.target.closest(".item");
  if (!item) return;
  const idx = Number(item.getAttribute("target-data"));
  const nama = item.querySelector(".n-produk").textContent;
  if (!confirm(`Hapus ${nama}?`)) return;
  cart.splice(idx, 1);
  tampilkanStruk();
  tampilkanKeranjang();
  Sound.playBell();
});

// fungsi input transaksi
let cart = [];

function inputTransaksi(e) {
	e.preventDefault();
	const inputNamaBarang = document.querySelector("#namaBarang");
	const inputHargaBarang = document.querySelector("#hargaBarang");
	const inputJumlahBarang = document.querySelector("#jumlahBarang");
	if (inputNamaBarang.value.trim() === "") {
		inputNamaBarang.focus();
		return;
	}
	if (inputHargaBarang.value.trim() === "" || inputHargaBarang.value.trim() === "0") {
		inputHargaBarang.focus();
		return;
	}
	if (inputJumlahBarang.value.trim() === "" || inputJumlahBarang.value.trim() === "0") {
		inputJumlahBarang.focus();
		return;
	}
	const namaBarang = document.querySelector("#namaBarang").value;
	const hargaBarang = Number(document.querySelector("#hargaBarang").value.replace(/\./g, ""));
	const jumlahBarang = Number(document.querySelector("#jumlahBarang").value.replace(",", "."));
	const diskonHarga = Number(document.querySelector("#diskonHarga").value.replace(/\./, ""));
	
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
	
	tampilkanStruk();
	tampilkanKeranjang();
	document.querySelector("#formStruk form").reset();
	inputNamaBarang.focus();
	Sound.playBell();
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
	lihatStruk
};