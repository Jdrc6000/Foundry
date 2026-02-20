/**
 * gallery.js — Enhanced gallery with lightbox + metadata
 *
 * Reads images loaded by main.js into #photo-grid and wires up:
 *  - Click to open full-size lightbox
 *  - Prev / Next navigation (buttons + keyboard arrows)
 *  - Escape to close
 *  - EXIF-style metadata from GitHub API response (size, filename, date via commit)
 */

(function () {
    const githubUsername = "Jdrc6000";
    const repoName = "foundry";
    const imagesPath = "assets/images";

    const lightbox = document.getElementById("lightbox");
    const lbImg = document.getElementById("lb-img");
    const lbTitle = document.getElementById("lb-title");
    const lbMeta = document.getElementById("lb-meta-grid");
    const lbClose = document.getElementById("lb-close");
    const lbPrev = document.getElementById("lb-prev");
    const lbNext = document.getElementById("lb-next");
    const photoGrid = document.getElementById("photo-grid");
    const countEl = document.getElementById("gallery-count");

    if (!lightbox || !photoGrid) return;

    let items = [];   // { src, name, size, sha, download_url }
    let current = 0;

    // ── 1. Fetch image list from GitHub ──────────────────────────────────────
    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    function formatName(filename) {
        return filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    }

    function buildGrid(files) {
        // Clear any existing content / skeletons
        photoGrid.innerHTML = "";
        items = files;

        if (countEl) {
            countEl.textContent = `${files.length} photo${files.length !== 1 ? "s" : ""}`;
        }

        files.forEach((file, index) => {
            const figure = document.createElement("figure");
            figure.tabIndex = 0;
            figure.setAttribute("role", "button");
            figure.setAttribute("aria-label", `View ${formatName(file.name)}`);

            const img = document.createElement("img");
            img.src = file.download_url;
            img.alt = formatName(file.name);
            img.loading = "lazy";

            const caption = document.createElement("figcaption");
            caption.textContent = formatName(file.name);

            figure.appendChild(img);
            figure.appendChild(caption);
            photoGrid.appendChild(figure);

            figure.addEventListener("click", () => openLightbox(index));
            figure.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") openLightbox(index);
            });
        });
    }

    // Show skeleton placeholders while loading
    function showSkeletons(n = 8) {
        for (let i = 0; i < n; i++) {
            const div = document.createElement("div");
            div.className = "photo-skeleton";
            photoGrid.appendChild(div);
        }
    }

    showSkeletons();

    fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/${imagesPath}`)
        .then(res => res.json())
        .then(files => {
            const images = Array.isArray(files)
                ? files.filter(f => f.type === "file" && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
                : [];

            if (images.length === 0) {
                photoGrid.innerHTML = "<p style='color:#888;grid-column:1/-1'>No images found.</p>";
                if (countEl) countEl.textContent = "0 photos";
                return;
            }

            buildGrid(images);
        })
        .catch(err => {
            console.error("Gallery: failed to load images", err);
            photoGrid.innerHTML = "<p style='color:#888;grid-column:1/-1'>Could not load images.</p>";
        });

    // ── 2. Lightbox ───────────────────────────────────────────────────────────
    function openLightbox(index) {
        current = index;
        renderLightbox();
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
        lbClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
    }

    function navigate(dir) {
        current = (current + dir + items.length) % items.length;
        renderLightbox();
    }

    function renderLightbox() {
        const file = items[current];
        if (!file) return;

        // Fade transition
        lbImg.style.opacity = "0";

        lbImg.onload = () => { lbImg.style.opacity = "1"; };
        lbImg.src = file.download_url;
        lbImg.alt = formatName(file.name);

        lbTitle.textContent = formatName(file.name);

        // Build metadata
        const ext = (file.name.match(/\.([^.]+)$/) || [])[1]?.toUpperCase() || "—";

        const metaItems = [
            { label: "Filename", value: file.name },
            { label: "Format", value: ext },
            { label: "Size", value: file.size ? formatBytes(file.size) : "—" },
            { label: "Photo", value: `${current + 1} of ${items.length}` },
        ];

        lbMeta.innerHTML = metaItems.map(m => `
            <div class="lb-meta-item">
                <span class="lb-meta-label">${m.label}</span>
                <span class="lb-meta-value">${m.value}</span>
            </div>
        `).join("");

        // Optionally fetch last-commit date for this file (async, non-blocking)
        fetchCommitDate(file.path);
    }

    function fetchCommitDate(filePath) {
        if (!filePath) return;
        fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/commits?path=${encodeURIComponent(filePath)}&per_page=1`)
            .then(r => r.json())
            .then(commits => {
                if (!Array.isArray(commits) || commits.length === 0) return;
                const date = new Date(commits[0].commit.author.date);
                const formatted = date.toLocaleDateString(undefined, {
                    year: "numeric", month: "long", day: "numeric"
                });
                // Append date to meta panel if lightbox is still showing same file
                const existing = lbMeta.querySelector("[data-meta-date]");
                if (existing) {
                    existing.querySelector(".lb-meta-value").textContent = formatted;
                } else {
                    const div = document.createElement("div");
                    div.className = "lb-meta-item";
                    div.dataset.metaDate = "1";
                    div.innerHTML = `
                        <span class="lb-meta-label">Added</span>
                        <span class="lb-meta-value">${formatted}</span>
                    `;
                    lbMeta.appendChild(div);
                }
            })
            .catch(() => { }); // silently ignore rate-limit / errors
    }

    // ── 3. Controls ───────────────────────────────────────────────────────────
    lbClose.addEventListener("click", closeLightbox);
    lbPrev.addEventListener("click", () => navigate(-1));
    lbNext.addEventListener("click", () => navigate(+1));

    // Click backdrop to close
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") navigate(-1);
        if (e.key === "ArrowRight") navigate(+1);
    });

    // Touch swipe
    let touchStartX = null;
    lightbox.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
        if (touchStartX === null) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
        touchStartX = null;
    }, { passive: true });
})();