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

    let items = [];
    let current = 0;

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    function formatName(filename) {
        return filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    }

    // ── Skeleton grid ─────────────────────────────────────────────────────────
    function showSkeletons(n = 8) {
        photoGrid.innerHTML = "";
        for (let i = 0; i < n; i++) {
            const div = document.createElement("div");
            div.className = "photo-skeleton";
            // Stagger each skeleton's shimmer phase so it doesn't look like a wall of uniform flashing
            div.style.animationDelay = `${(i % 4) * -0.35}s`;
            photoGrid.appendChild(div);
        }
    }

    // ── Build grid ────────────────────────────────────────────────────────────
    function buildGrid(files) {
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

            // Start hidden for staggered reveal
            figure.style.opacity = "0";
            figure.style.transform = "scale(0.97)";

            const img = document.createElement("img");
            img.src = file.download_url;
            img.alt = formatName(file.name);
            img.loading = "lazy";

            const caption = document.createElement("figcaption");
            caption.textContent = formatName(file.name);

            figure.appendChild(img);
            figure.appendChild(caption);
            photoGrid.appendChild(figure);

            // Staggered fade-in: wait for image to load, then animate
            const delay = index * 50;
            img.addEventListener("load", () => {
                setTimeout(() => {
                    figure.style.transition = "opacity 0.35s ease, transform 0.35s ease";
                    figure.style.opacity = "1";
                    figure.style.transform = "scale(1)";
                }, delay);
            });

            // If image fails to load still reveal the figure
            img.addEventListener("error", () => {
                setTimeout(() => {
                    figure.style.transition = "opacity 0.35s ease, transform 0.35s ease";
                    figure.style.opacity = "1";
                    figure.style.transform = "scale(1)";
                }, delay);
            });

            figure.addEventListener("click", () => openLightbox(index));
            figure.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") openLightbox(index);
            });
        });
    }

    showSkeletons();
    if (countEl) countEl.textContent = "Loading…";

    fetch(`https://foundry-proxy.joshuadanielcarter.workers.dev/repos/${githubUsername}/${repoName}/contents/${imagesPath}`)
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
            if (countEl) countEl.textContent = "";
        });

    // ── Lightbox ──────────────────────────────────────────────────────────────
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

        lbImg.style.opacity = "0";
        lbImg.onload = () => {
            lbImg.style.transition = "opacity 0.25s ease";
            lbImg.style.opacity = "1";
        };
        lbImg.src = file.download_url;
        lbImg.alt = formatName(file.name);

        lbTitle.textContent = formatName(file.name);

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

        fetchCommitDate(file.path);
    }

    function fetchCommitDate(filePath) {
        if (!filePath) return;
        fetch(`https://foundry-proxy.joshuadanielcarter.workers.dev/repos/${githubUsername}/${repoName}/commits?path=${encodeURIComponent(filePath)}&per_page=1`)
            .then(r => r.json())
            .then(commits => {
                if (!Array.isArray(commits) || commits.length === 0) return;
                const date = new Date(commits[0].commit.author.date);
                const formatted = date.toLocaleDateString(undefined, {
                    year: "numeric", month: "long", day: "numeric"
                });
                const existing = lbMeta.querySelector("[data-meta-date]");
                if (existing) {
                    existing.querySelector(".lb-meta-value").textContent = formatted;
                } else {
                    const div = document.createElement("div");
                    div.className = "lb-meta-item";
                    div.dataset.metaDate = "1";
                    div.style.opacity = "0";
                    div.innerHTML = `
                        <span class="lb-meta-label">Added</span>
                        <span class="lb-meta-value">${formatted}</span>
                    `;
                    lbMeta.appendChild(div);
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                        div.style.transition = "opacity 0.3s ease";
                        div.style.opacity = "1";
                    }));
                }
            })
            .catch(() => { });
    }

    // ── Controls ──────────────────────────────────────────────────────────────
    lbClose.addEventListener("click", closeLightbox);
    lbPrev.addEventListener("click", () => navigate(-1));
    lbNext.addEventListener("click", () => navigate(+1));

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") navigate(-1);
        if (e.key === "ArrowRight") navigate(+1);
    });

    let touchStartX = null;
    lightbox.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
        if (touchStartX === null) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
        touchStartX = null;
    }, { passive: true });
})();