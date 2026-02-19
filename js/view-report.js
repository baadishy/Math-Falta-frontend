/* View report page script
   - Runs after DOMContentLoaded
   - Embeds PDFs directly when possible or uses Google Viewer
   - Shows a helpful hint if preview likely blocked
   - Adds an "Open raw" action and wires the Download anchor with filename
*/
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const viewer = document.getElementById("viewer");
    const downloadLink = document.getElementById("downloadLink");
    const fileNameEl = document.getElementById("file-name");
    const fileHintEl = document.getElementById("file-hint");
    const fileActions = document.getElementById("file-actions");

    function qs(name) {
      const params = new URLSearchParams(window.location.search);
      return params.get(name);
    }

    const fileUrl = qs("url");

    if (!viewer) return;

    if (!fileUrl) {
      viewer.srcdoc =
        '<div style="padding:24px; text-align:center; color:#64748b">No file URL provided.</div>';
      if (downloadLink) downloadLink.style.display = "none";
      if (fileHintEl) fileHintEl.textContent = "No report URL provided.";
      return;
    }

    // Add Open raw action
    if (fileActions) {
      const openA = document.createElement("a");
      openA.href = fileUrl;
      openA.target = "_blank";
      // openA.rel = "noopener noreferrer";
      openA.textContent = "Open raw";
      openA.className = "hint";
      fileActions.appendChild(openA);
    }

    // Infer and display filename
    try {
      if (fileNameEl) {
        const u = new URL(fileUrl);
        const last = u.pathname.split("/").pop() || "Report";
        fileNameEl.textContent = decodeURIComponent(last);
      }
    } catch (e) {
      // ignore
    }

    const isPdf = /\.pdf(\?|$)/i.test(fileUrl);

    // Preview loaded flag
    let loaded = false;
    viewer.addEventListener("load", () => {
      loaded = true;
      if (fileHintEl) fileHintEl.textContent = "Preview loaded.";
    });

    if (isPdf) {
      viewer.src = fileUrl;
    } else {
      const gview =
        "https://docs.google.com/gview?url=" +
        encodeURIComponent(fileUrl) +
        "&embedded=true";
      viewer.src = gview;
    }

    // If preview does not report 'load' in 2s, show hint (host may block embedding)
    setTimeout(() => {
      if (!loaded && fileHintEl) {
        fileHintEl.textContent =
          "Preview may be blocked by the file host. Use Download or Open raw.";
      }
    }, 2000);

    // Wire download anchor
    if (downloadLink) {
      downloadLink.href = fileUrl;

      async function downloadFile(url, filename) {
        const res = await fetch(url);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
      }

      downloadLink.addEventListener("click", (e) => {
        e.preventDefault(); // prevent normal navigation
        downloadFile(fileUrl, "report.svg");
      });

      // try {
      //   const u = new URL(fileUrl);
      //   const name = decodeURIComponent(
      //     u.pathname.split("/").pop() || "report.pdf",
      //   );
      //   downloadLink.setAttribute("download", "report.svg");
      // } catch (e) {
      //   downloadLink.setAttribute("download", "report.svg");
      // }
    }
  });
})();
