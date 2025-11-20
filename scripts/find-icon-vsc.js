
try {
    const vscIcons = require("react-icons/vsc");
    const keys = Object.keys(vscIcons).filter(k => k.toLowerCase().includes("code"));
    console.log("VSC keys:", keys.slice(0, 10));
} catch (e) {
    console.log("Error loading react-icons/vsc");
}
