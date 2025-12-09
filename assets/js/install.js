let deferredPrompt = null;

// ✅ Deteksi mode PWA
function isAppInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches ||
         window.navigator.standalone === true;
}

// ✅ Tampilkan / sembunyikan tombol
function toggleInstallButton() {
  const btn = document.getElementById("btnInstallApp");
  if (!btn) return;

  const installedFlag = localStorage.getItem("appKasirInstalled");

  // ✅ SEMBUNYI jika:
  // 1. Dibuka sebagai PWA
  // 2. ATAU pernah install sebelumnya
  if (isAppInstalled() || installedFlag === "yes") {
    btn.style.display = "none";
  } else {
    btn.style.display = "flex";
  }
}

// ✅ Tangkap event sebelum install
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  toggleInstallButton();
});

// ✅ Klik tombol install
document.getElementById("btnInstallApp")?.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const result = await deferredPrompt.userChoice;

  if (result.outcome === "accepted") {
    localStorage.setItem("appKasirInstalled", "yes"); // ✅ JANGAN pernah dihapus otomatis
  }

  deferredPrompt = null;
  toggleInstallButton();
});

// ✅ Event resmi setelah sukses install
window.addEventListener("appinstalled", () => {
  localStorage.setItem("appKasirInstalled", "yes");
  toggleInstallButton();
});

// ✅ Saat halaman dibuka / reload
document.addEventListener("DOMContentLoaded", () => {
  toggleInstallButton();
});