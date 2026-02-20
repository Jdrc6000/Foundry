(function () {
    const CONFIG = window.PROJECTS_CONFIG || {};
    const githubUsername = CONFIG.username || "Jdrc6000";
    const commitsToShow = CONFIG.commits || 7;

    const listEl = document.getElementById("projects-list");
    const countEl = document.getElementById("projects-count");

    if (!listEl) return;

    // Helpers
    function formatDate(dateStr) {
        const d = new Date(dateStr);

        const date = d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        const time = d.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        return `${date} · ${time}`;
    }

    function repoUrl(repo) {
        return `https://github.com/${githubUsername}/${repo}`;
    }

    // Skeletons
    function showSkeletons(n = 3) {
        listEl.innerHTML = "";
        for (let i = 0; i < n; i++) {
            const li = document.createElement("li");
            li.className = "project-skeleton";
            li.innerHTML = `
                <div class="skeleton-line" style="width:40%;height:1.2rem;"></div>
                <div class="skeleton-line" style="width:90%;height:0.85rem;margin-top:1rem;"></div>
                <div class="skeleton-line" style="width:80%;height:0.85rem;"></div>
                <div class="skeleton-line" style="width:85%;height:0.85rem;"></div>
                <div class="skeleton-line" style="width:60%;height:0.85rem;"></div>
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
            const msg = c.commit.message.split("\n")[0]; // first line only
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
        `;
        return li;
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // Fetch repos, then commits
    showSkeletons();

    fetch(`https://api.github.com/users/${githubUsername}/repos?sort=pushed&per_page=100`)
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

            // Show correct number of skeletons now we know the count
            showSkeletons(repos.length);

            const requests = repos.map(repo =>
                fetch(`https://api.github.com/repos/${githubUsername}/${repo.name}/commits?per_page=${commitsToShow}`)
                    .then(r => {
                        if (!r.ok) throw new Error(`HTTP ${r.status}`);
                        return r.json();
                    })
                    .then(commits => ({ repo: repo.name, commits, error: null }))
                    .catch(err => ({ repo: repo.name, commits: [], error: err }))
            );

            Promise.all(requests).then(results => {
                listEl.innerHTML = "";
                results.forEach(({ repo, commits, error }) => {
                    if (error) {
                        const li = document.createElement("li");
                        li.className = "project-card";
                        li.innerHTML = `
                            <div class="project-card-header">
                                <h3 class="project-card-title">${repo}</h3>
                            </div>
                            <p class="projects-error">Could not load commits for <strong>${repo}</strong>.</p>
                        `;
                        listEl.appendChild(li);
                    } else {
                        listEl.appendChild(buildCard(repo, commits));
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