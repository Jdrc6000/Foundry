(function () {
    const CONFIG = window.PROJECTS_CONFIG || {};
    const githubUsername = CONFIG.username || "Jdrc6000";
    const commitsToShow = CONFIG.commits || 7;

    const PROXY = "https://foundry-proxy.joshuadanielcarter.workers.dev";

    const listEl = document.getElementById("projects-list");
    const countEl = document.getElementById("projects-count");

    if (!listEl) return;

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        const date = d.toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric"
        });
        const time = d.toLocaleTimeString(undefined, {
            hour: "2-digit", minute: "2-digit", hour12: true
        });
        return `${date} · ${time}`;
    }

    function repoUrl(repo) {
        return `https://github.com/${githubUsername}/${repo}`;
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    function estimateLOC(totalBytes) {
        const loc = Math.round(totalBytes / 50);
        if (loc >= 1000) return `~${(loc / 1000).toFixed(1)}k LOC`;
        return `~${loc} LOC`;
    }

    // "Python 72% · Lua 28%  ·  4.2 KB · ~420 LOC"
    function buildLangString(langs) {
        const entries = Object.entries(langs);
        if (entries.length === 0) return null;
        const total = entries.reduce((s, [, v]) => s + v, 0);
        const breakdown = entries
            .sort((a, b) => b[1] - a[1])
            .map(([lang, bytes]) => `${lang} ${Math.round((bytes / total) * 100)}%`)
            .join(" · ");
        return `${breakdown} &nbsp;·&nbsp; ${formatBytes(total)} · ${estimateLOC(total)}`;
    }

    // Polished skeleton loader
    function showSkeletons(n = 3) {
        listEl.innerHTML = "";
        const patterns = [
            ["55%", "88%", "72%", "80%", "65%"],
            ["42%", "91%", "78%", "84%", "70%"],
            ["60%", "76%", "93%", "68%", "82%"],
        ];
        for (let i = 0; i < n; i++) {
            const pat = patterns[i % patterns.length];
            const li = document.createElement("li");
            li.className = "project-skeleton";
            li.style.animationDelay = `${i * 80}ms`;
            li.innerHTML = `
                <div class="project-skeleton-header">
                    <div class="sk-line sk-title" style="width:${pat[0]}"></div>
                    <div class="sk-badge"></div>
                </div>
                <div class="project-skeleton-commits">
                    ${pat.slice(1).map((w, j) => `
                        <div class="sk-commit" style="animation-delay:${(i * 5 + j) * 60}ms">
                            <div class="sk-dot"></div>
                            <div class="sk-line" style="width:${w}"></div>
                            <div class="sk-line sk-date"></div>
                        </div>
                    `).join("")}
                </div>
                <div class="project-skeleton-footer">
                    <div class="sk-line" style="width:140px;height:0.7rem;"></div>
                    <div class="sk-line" style="width:120px;height:0.7rem;"></div>
                </div>
            `;
            listEl.appendChild(li);
        }
    }

    // Card renderer
    function buildCard(repo, commits) {
        const li = document.createElement("li");
        li.className = "project-card";

        const latestDate = commits.length
            ? formatDate(commits[0].commit.author.date)
            : null;

        const commitsHtml = commits.slice(0, commitsToShow).map(c => {
            const msg = c.commit.message.split("\n")[0];
            const date = formatDate(c.commit.author.date);
            return `
                <li class="commit-item">
                    <span class="commit-dot"></span>
                    <span class="commit-message">${escapeHtml(msg)}</span>
                    <span class="commit-date">${date}</span>
                </li>
            `;
        }).join("");

        li.innerHTML = `
            <div class="project-card-header">
                <h3 class="project-card-title">
                    <a href="${repoUrl(repo)}" target="_blank" rel="noopener">${repo}</a>
                    <span class="project-repo-badge">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                            0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                            -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                            .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                            -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
                            .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
                            .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
                            0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8
                            c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        GitHub
                    </span>
                </h3>
            </div>
            <ul class="project-card-commits">
                ${commitsHtml || '<li class="commit-item"><span class="commit-message" style="color:#aaa">No commits found.</span></li>'}
            </ul>
            <div class="project-card-footer">
                ${latestDate ? `<span class="project-card-meta">Last updated ${latestDate}</span>` : '<span></span>'}
                <a class="project-card-link" href="${repoUrl(repo)}" target="_blank" rel="noopener">View on GitHub →</a>
            </div>
            <div class="project-card-langs" id="langs-${repo}">
                <span class="project-langs-loading">Loading languages…</span>
            </div>
        `;
        return li;
    }

    // Inject language info into a rendered card
    function injectLangs(repo, langs) {
        const el = document.getElementById(`langs-${repo}`);
        if (!el) return;
        const str = buildLangString(langs);
        if (!str) {
            el.remove();
            return;
        }
        el.innerHTML = `<span class="project-langs">${str}</span>`;
        el.style.opacity = "0";
        requestAnimationFrame(() => requestAnimationFrame(() => {
            el.style.transition = "opacity 0.3s ease";
            el.style.opacity = "1";
        }));
    }

    // Fetch
    showSkeletons();

    fetch(`${PROXY}/users/${githubUsername}/repos?sort=pushed&per_page=100`)
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .then(repos => {
            if (!Array.isArray(repos) || repos.length === 0) {
                listEl.innerHTML = '<p class="projects-error">No public repositories found.</p>';
                if (countEl) countEl.textContent = "0 repos";
                return;
            }

            if (countEl) {
                countEl.textContent = `${repos.length} repo${repos.length !== 1 ? "s" : ""}`;
            }

            showSkeletons(repos.length);

            const commitRequests = repos.map(repo =>
                fetch(`${PROXY}/repos/${githubUsername}/${repo.name}/commits?per_page=${commitsToShow}`)
                    .then(r => {
                        if (!r.ok) throw new Error(`HTTP ${r.status}`);
                        return r.json();
                    })
                    .then(commits => ({ repo: repo.name, commits, error: null }))
                    .catch(err => ({ repo: repo.name, commits: [], error: err }))
            );

            Promise.all(commitRequests).then(results => {
                listEl.innerHTML = "";
                results.forEach(({ repo, commits, error }, i) => {
                    let card;
                    if (error) {
                        const li = document.createElement("li");
                        li.className = "project-card";
                        li.innerHTML = `
                            <div class="project-card-header">
                                <h3 class="project-card-title">${repo}</h3>
                            </div>
                            <p class="projects-error">Could not load commits for <strong>${repo}</strong>.</p>
                        `;
                        card = li;
                    } else {
                        card = buildCard(repo, commits);
                    }
                    card.style.opacity = "0";
                    card.style.transform = "translateY(8px)";
                    card.style.transition = `opacity 0.3s ease ${i * 40}ms, transform 0.3s ease ${i * 40}ms`;
                    listEl.appendChild(card);
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            card.style.opacity = "1";
                            card.style.transform = "translateY(0)";
                        });
                    });

                    if (!error) {
                        fetch(`${PROXY}/repos/${githubUsername}/${repo}/languages`)
                            .then(r => r.ok ? r.json() : {})
                            .then(langs => injectLangs(repo, langs))
                            .catch(() => {
                                const el = document.getElementById(`langs-${repo}`);
                                if (el) el.remove();
                            });
                    }
                });
            });
        })
        .catch(err => {
            console.error("Projects: failed to fetch repos", err);
            listEl.innerHTML = '<p class="projects-error">Could not load repositories. Check the username or try again later.</p>';
            if (countEl) countEl.textContent = "";
        });
})();