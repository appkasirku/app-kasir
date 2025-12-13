import { Sound } from './sound.js';

let deferredPrompt = null;

const loader = document.querySelector("#installLoader");

function showInstallLoader() {
  loader?.classList.remove("hidden");
}

function hideInstallLoader() {
  loader?.classList.add("hidden");
}

const btnInstall = document.querySelector("#btnInstallApp");
const offlineBar = document.querySelector("#offlineBar");

// fungsi deteksi mode PWA
function isAppInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

// fungsi toas notifikasi
function toast(text, anchorEl = null) {
  let el = document.querySelector("#toast");
  // tahan jika elemen masih ada
  if (el) return;
  // buat elemen jika belum ada
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    const arrow = document.createElement("div");
    arrow.id = "toastArrow";
    const span = document.createElement("span");
    el.appendChild(arrow);
    el.appendChild(span);
    document.body.appendChild(el);
  }
  const textEl = el.querySelector("span");
  const arrowEl = el.querySelector("#toastArrow");
  textEl.textContent = text;
  el.style.display = "block";
  // style utama
  el.style.position = "fixed";
  el.style.zIndex = "999999";
  el.style.padding = "8px 10px";
  el.style.borderRadius = "8px";
  el.style.fontSize = "12px";
  el.style.background = "#111";
  el.style.color = "#fff";
  el.style.border = "1px solid #ffffff35";
  el.style.boxShadow = "0 6px 16px rgba(0,0,0,0.3)";
  el.style.maxWidth = "230px";
  el.style.opacity = "0";
  el.style.transition = "opacity .2s ease, transform .2s ease";
  // style panah
  arrowEl.style.position = "absolute";
  arrowEl.style.width = "0";
  arrowEl.style.height = "0";
  requestAnimationFrame(() => {
    el.style.opacity = "1";
  });
  // mode tooltip pakai achor
  if (anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    // render dulu agar ukuran valid
    el.style.top = "0px";
    el.style.left = "0px";
    const toastRect = el.getBoundingClientRect();
    const toastWidth = toastRect.width;
    const centerX = rect.left + rect.width / 2;
    // clamp posisi toast agar tetap masuk layar
    let left = centerX - toastWidth / 2;
    const minLeft = 10;
    const maxLeft = window.innerWidth - toastWidth - 10;
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;
    el.style.left = `${left}px`;
    // tentukan atas / bawah otomatis
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow > 90) {
      // toast di bawah
      el.style.top = `${rect.bottom + 12}px`;
      el.style.transform = "translateY(-4px)";
      arrowEl.style.top = "-8px";
      arrowEl.style.bottom = "auto";
      arrowEl.style.borderLeft = "8px solid transparent";
      arrowEl.style.borderRight = "8px solid transparent";
      arrowEl.style.borderBottom = "8px solid #111";
      arrowEl.style.borderTop = "none";
    } else {
      // toast di atas
      el.style.top = `${rect.top - 60}px`;
      el.style.transform = "translateY(4px)";
      arrowEl.style.bottom = "-8px";
      arrowEl.style.top = "auto";
      arrowEl.style.borderLeft = "8px solid transparent";
      arrowEl.style.borderRight = "8px solid transparent";
      arrowEl.style.borderTop = "8px solid #111";
      arrowEl.style.borderBottom = "none";
    }
    // fix utama bug panah oinggir layar
    let arrowLeft = centerX - left - 8;
    // clamp panah agar tidak pernah keluar toast
    const minArrow = 10;
    const maxArrow = toastWidth - 22;
    if (arrowLeft < minArrow) arrowLeft = minArrow;
    if (arrowLeft > maxArrow) arrowLeft = maxArrow;
    arrowEl.style.left = `${arrowLeft}px`;
  }
  // mode toast global
  else {
    const toastRect = el.getBoundingClientRect();
    const toastWidth = toastRect.width;
    el.style.top = "auto";
    el.style.left = "auto";
    el.style.maxWidth = `${toastWidth}px`;
    el.style.position = "relative";
    el.style.margin = "25dvh auto auto";
    arrowEl.style.border = "none";
  }
  // auto hide + fade out
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => {
      el.remove();
      el.style.display = "none";
    }, 200);
  }, 2500);
}

// fungsi update status tombol
function updateInstallButton() {
  if (!btnInstall) return;

  // jika dibuka sebagai PWA -> sembunyikan tombol
  if (isAppInstalled()) {
    btnInstall.classList.remove("show");
    return;
  }

  // jika sudah install -> jadi tombol buka
  if (localStorage.getItem("appKasirInstalled") === "yes") {
    btnInstall.classList.add("show");
    btnInstall.textContent = "Buka Aplikasi";
    btnInstall.dataset.mode = "open";
    return;
  }

  // jika belum install -> jadi tombol install
  btnInstall.classList.add("show");
  btnInstall.textContent = "Install Aplikasi";
  btnInstall.dataset.mode = "install";
}

// event klik install aplikasi
btnInstall?.addEventListener("click", async () => {
  const mode = btnInstall.dataset.mode;

  // mode buka aplikasi
  if (mode === "open") {
    window.open("/app-kasir/", "_blank");
    return;
  }

  // mode install aplikasi
  if (mode === "install") {
    if (!deferredPrompt) {
      toast("❌ Install belum tersedia di perangkat Anda");
      return;
    }
    
    // event saat proses install
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      showInstallLoader();
      deferredPrompt = "next";
      Sound.playProcess();
    } else {
      toast("❌ Install dibatalkan");
    }

  }
});

// sebelum install aplikasi
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  localStorage.removeItem("appKasirInstalled");
  updateInstallButton();
});

// setelah aplikasi benar-benar terinstall
window.addEventListener("appinstalled", () => {
  if (deferredPrompt === "next") {
    deferredPrompt = null;
  } else {
    localStorage.setItem("appKasirInstalled", "yes");
    hideInstallLoader();
    toast("✅ Aplikasi berhasil diinstall");
    updateInstallButton();
    Sound.stopProcess();
  }
});

// saat tab aktif lagi (cek setelah install)
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateInstallButton();
});

// event load splash screen saat aplikasi dimuat
window.addEventListener("load", () => {
  const splash = document.querySelector("#splashScreen");
  setTimeout(() => {
    splash?.remove();
    updateInstallButton();
  }, 900);
});

// event status offline/online
window.addEventListener("online", () => {
  if (offlineBar) offlineBar.style.display = "none";
  toast("✅ Koneksi kembali terhubung");
});
window.addEventListener("offline", () => {
  if (offlineBar) offlineBar.style.display = "block";
  toast("⚠️ Perangkat sedang offline");
});

if (isAppInstalled()) {
    document.querySelector(".splash")?.classList.remove("fix");
  } else {
    document.querySelector(".splash")?.classList.add("fix");
  }

// auto reload jika PWa update
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

export const Install = {
  toast,
  isAppInstalled,
  updateInstallButton
};