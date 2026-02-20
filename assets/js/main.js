const githubUsername = "Jdrc6000";

// Featured project on home page — shows repo with the latest commit
const featuredProject = document.getElementById("featured-project");

if (featuredProject) {
    fetch(`https://api.github.com/users/${githubUsername}/repos?sort=pushed&per_page=1`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(repos => {
            if (!Array.isArray(repos) || repos.length === 0) throw new Error("No repos found");
            const repo = repos[0];
            return fetch(`https://api.github.com/repos/${githubUsername}/${repo.name}/commits?per_page=1`)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                })
                .then(commits => ({ repo, commit: commits[0] || null }));
        })
        .then(({ repo, commit }) => {
            if (!commit) throw new Error("No commits found");

            const date = new Date(commit.commit.author.date);
            const formattedDate = date.toLocaleDateString(undefined, {
                year: "numeric", month: "long", day: "numeric"
            });
            const formattedTime = date.toLocaleTimeString(undefined, {
                hour: "2-digit", minute: "2-digit", hour12: true
            });

            featuredProject.innerHTML = `
                <h3><a href="https://github.com/${githubUsername}/${repo.name}" target="_blank" rel="noopener">${repo.name}</a></h3>
                <p>${commit.commit.message.split("\n")[0]}</p>
                <p style="font-size:0.85rem;color:#888;">${formattedDate} &middot; ${formattedTime}</p>
            `;
        })
        .catch(err => {
            console.error("Featured project: failed to load", err);
            featuredProject.innerHTML = `<p style="color:#888;font-style:italic;">Could not load project data.</p>`;
        });
}