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

    // Attempt to fetch the report and embed SVG directly when possible (improves preview reliability).
    let embeddedSvgText = null;
    (async function tryEmbedOrFallback() {
      try {
        const resp = await fetch(fileUrl, { cache: "no-store" });
        if (resp.ok) {
          const ct = resp.headers.get("content-type") || "";
          const text = await resp.text();

          // If it's an SVG (content-type or startsWith), embed it into the iframe
          if (ct.includes("svg") || text.trim().startsWith("<svg")) {
            embeddedSvgText = text;
            const wrapper = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">${text}</body></html>`;
            try {
              viewer.srcdoc = wrapper;
              loaded = true;
              if (fileHintEl) fileHintEl.textContent = "Preview loaded.";
            } catch (e) {
              // if srcdoc not supported, fallback to data URL
              viewer.src =
                "data:text/html;charset=utf-8," + encodeURIComponent(wrapper);
              loaded = true;
            }

            // extract percentage and embedded logo (if any) and render donut
            const pctMatch =
              text.match(/>(\d{1,3})%<\/?text/i) || text.match(/(\d{1,3})%/);
            const pct = pctMatch ? Number(pctMatch[1]) : null;
            const logoMatch = text.match(
              /href\s*=\s*"(data:image\/(png|jpeg);base64,[^"]+)"/i,
            );
            const logoUri = logoMatch ? logoMatch[1] : null;
            if (logoUri) {
              const img = document.querySelector(".brand img");
              if (img) img.src = logoUri;
            }
            if (pct !== null && !Number.isNaN(pct)) renderDonut(pct);
            return;
          }
        }
      } catch (e) {
        // fetching may fail due to CORS or host blocking — fall back below
      }

      // Fallback: use Google Viewer for non-pdfs or direct URL for PDFs
      if (isPdf) {
        viewer.src = fileUrl;
      } else {
        const gview =
          "https://docs.google.com/gview?url=" +
          encodeURIComponent(fileUrl) +
          "&embedded=true";
        viewer.src = gview;
      }
    })();

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
        // If we embedded the SVG already, download that directly
        if (embeddedSvgText) {
          const blob = new Blob([embeddedSvgText], { type: "image/svg+xml" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = filename;
          a.click();
          URL.revokeObjectURL(a.href);
          return;
        }
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
        downloadFile(fileUrl, embeddedSvgText ? "report.svg" : "report.svg");
      });

      // Donut rendering helper
      function renderDonut(percent) {
        const holder = document.getElementById("donut-holder");
        if (!holder) return;
        const size = 120;
        const stroke = 14;
        const radius = (size - stroke) / 2;
        const c = 2 * Math.PI * radius;
        const offset = c * (1 - percent / 100);

        const svg = `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="dg" x1="0" x2="1">
                <stop offset="0%" stop-color="#10b981"/>
                <stop offset="100%" stop-color="#06b6d4"/>
              </linearGradient>
            </defs>
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="#eef2ff" stroke-width="${stroke}"/>
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="url(#dg)" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round" transform="rotate(-90 ${size / 2} ${size / 2})" />
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial" font-weight="700" font-size="20">${percent}%</text>
          </svg>
        `;
        holder.innerHTML = svg;
      }

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
