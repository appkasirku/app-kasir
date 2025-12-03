async function setServiceWorker() {
	if (!("serviceWorker" in navigator)) return;
	try {
		await navigator.serviceWorker.register("/sw.js", { scope: "/app-kasir/" });
		console.log("SW registered");
	} catch (err) {
		console.error("SW failed", err);
	}
}

export const Register = {
	setServiceWorker
}
