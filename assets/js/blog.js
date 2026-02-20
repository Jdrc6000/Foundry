/*
Expects a file at blog/posts/index.json in your repo:
[
    {
    "slug": "my-first-post",
    "title": "My First Post",
    "date": "2026-02-20",
    "tags": ["general"],
    "excerpt": "A short summary shown on the listing page."
    }
]
 */
(function () {
    const CONFIG = window.BLOG_CONFIG || {};
    const githubUsername = CONFIG.username || "Jdrc6000";
    const repoName = CONFIG.repo || "foundry";
    const branch = CONFIG.branch || "main";
    const postsPath = "blog/posts";

    const raw = (path) =>
        `https://raw.githubusercontent.com/${githubUsername}/${repoName}/${branch}/${path}`;

    // ── Tiny Markdown → HTML renderer ────────────────────────────────────────
    function parseMarkdown(md) {
        let html = md
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
            `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`
        );
        html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
        html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
        html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
        html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
        html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
        html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
        html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
        html = html.replace(/<\/blockquote>\n?<blockquote>/g, "<br>");
        html = html.replace(/^(-{3,}|\*{3,})$/gm, "<hr>");
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
        html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
        html = html.replace(/_(.+?)_/g, "<em>$1</em>");
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        html = html.replace(/^[\*\-] (.+)$/gm, "<li>$1</li>");
        html = html.replace(/(<li>.*<\/li>\n?)+/g, match => `<ul>${match}</ul>`);
        html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
        html = html.split(/\n{2,}/).map(block => {
            block = block.trim();
            if (!block) return "";
            const blockTags = /^<(h[1-6]|ul|ol|li|pre|blockquote|hr|img)/;
            if (blockTags.test(block)) return block;
            return `<p>${block.replace(/\n/g, "<br>")}</p>`;
        }).join("\n");

        return html;
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr + "T12:00:00");
        return d.toLocaleDateString(undefined, {
            year: "numeric", month: "long", day: "numeric"
        });
    }

    // ── Skeleton loader ───────────────────────────────────────────────────────
    function showBlogSkeletons(container, n = 4) {
        container.innerHTML = "";
        const excerptWidths = [
            ["70%", "88%", "55%"],
            ["85%", "60%", "75%"],
            ["65%", "80%", "90%"],
            ["78%", "50%", "68%"],
        ];
        for (let i = 0; i < n; i++) {
            const ws = excerptWidths[i % excerptWidths.length];
            const li = document.createElement("li");
            li.className = "post-skeleton";
            li.innerHTML = `
                <div class="sk-line sk-post-title" style="width:${ws[0]}"></div>
                <div class="sk-post-meta">
                    <div class="sk-line sk-meta-date"></div>
                    <div class="sk-line sk-meta-tag"></div>
                    <div class="sk-line sk-meta-tag" style="width:48px;"></div>
                </div>
                <div class="sk-line sk-post-excerpt" style="width:${ws[1]}"></div>
                <div class="sk-line sk-post-excerpt" style="width:${ws[2]}"></div>
                <div class="sk-line sk-post-read"></div>
            `;
            li.style.animationDelay = `${i * 80}ms`;
            container.appendChild(li);
        }
    }

    // ── Blog listing page ─────────────────────────────────────────────────────
    const listEl = document.getElementById("posts-list");
    const countEl = document.getElementById("blog-count");

    if (listEl) {
        showBlogSkeletons(listEl);
        if (countEl) countEl.textContent = "Loading…";

        fetch(raw(`${postsPath}/index.json`))
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(posts => {
                posts.sort((a, b) => new Date(b.date) - new Date(a.date));
                if (countEl) {
                    countEl.textContent = `${posts.length} post${posts.length !== 1 ? "s" : ""}`;
                }
                listEl.innerHTML = "";
                posts.forEach((post, i) => {
                    const li = document.createElement("li");
                    li.className = "post-card";
                    const tagsHtml = (post.tags || [])
                        .map(t => `<span class="tag">${t}</span>`)
                        .join("");
                    li.innerHTML = `
                        <h3 class="post-card-title">
                            <a href="post.html?slug=${encodeURIComponent(post.slug)}">${post.title}</a>
                        </h3>
                        <div class="post-card-meta">
                            <span class="post-card-date">${formatDate(post.date)}</span>
                            ${tagsHtml ? `<span class="post-card-tags">${tagsHtml}</span>` : ""}
                        </div>
                        ${post.excerpt ? `<p class="post-card-excerpt">${post.excerpt}</p>` : ""}
                        <a class="post-card-read" href="post.html?slug=${encodeURIComponent(post.slug)}">Read post →</a>
                    `;
                    // Staggered fade-in
                    li.style.opacity = "0";
                    li.style.transform = "translateY(8px)";
                    li.style.transition = `opacity 0.3s ease ${i * 50}ms, transform 0.3s ease ${i * 50}ms`;
                    listEl.appendChild(li);
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                        li.style.opacity = "1";
                        li.style.transform = "translateY(0)";
                    }));
                });
            })
            .catch(err => {
                console.error("Blog: failed to load index", err);
                listEl.innerHTML = '<p class="blog-error">Could not load posts. Make sure <code>blog/posts/index.json</code> exists in your repo.</p>';
                if (countEl) countEl.textContent = "";
            });
    }

    // ── Post reader page ──────────────────────────────────────────────────────
    const postContainer = document.getElementById("post-container");

    if (postContainer) {
        // Show inline skeleton for post reader
        postContainer.innerHTML = `
            <div class="post-skeleton-reader">
                <div class="sk-line" style="width:80px;height:0.8rem;margin-bottom:2rem;"></div>
                <div class="post-skeleton-reader-header">
                    <div class="sk-line sk-post-title" style="width:85%"></div>
                    <div class="sk-line sk-post-title" style="width:55%;height:1.6rem;margin-top:0.5rem;"></div>
                    <div class="sk-post-meta" style="margin-top:1rem;">
                        <div class="sk-line sk-meta-date"></div>
                        <div class="sk-line sk-meta-tag"></div>
                    </div>
                </div>
                <div class="post-skeleton-reader-body">
                    ${[92, 87, 75, 95, 60, 88, 70, 82].map(w => `
                        <div class="sk-line" style="width:${w}%;height:0.85rem;margin-bottom:0.6rem;"></div>
                    `).join("")}
                    <div class="sk-line" style="width:40%;height:0.85rem;margin-bottom:1.5rem;"></div>
                    ${[78, 91, 65, 85].map(w => `
                        <div class="sk-line" style="width:${w}%;height:0.85rem;margin-bottom:0.6rem;"></div>
                    `).join("")}
                </div>
            </div>
        `;

        const params = new URLSearchParams(window.location.search);
        const slug = params.get("slug");

        if (!slug) {
            postContainer.innerHTML = '<p class="blog-error">No post specified.</p>';
        } else {
            fetch(raw(`${postsPath}/index.json`))
                .then(r => r.json())
                .then(posts => {
                    const meta = posts.find(p => p.slug === slug);
                    return fetch(raw(`${postsPath}/${slug}.md`))
                        .then(r => {
                            if (!r.ok) throw new Error(`HTTP ${r.status}`);
                            return r.text();
                        })
                        .then(md => ({ md, meta }));
                })
                .then(({ md, meta }) => {
                    if (meta) document.title = `${meta.title} — Foundry`;
                    const tagsHtml = (meta?.tags || [])
                        .map(t => `<span class="tag">${t}</span>`)
                        .join("");

                    postContainer.style.opacity = "0";
                    postContainer.innerHTML = `
                        <a class="post-back" href="index.html">← Back to Blog</a>
                        <div class="post-header">
                            <h1 class="post-title">${meta?.title || slug}</h1>
                            <div class="post-meta">
                                ${meta?.date ? `<span class="post-date">${formatDate(meta.date)}</span>` : ""}
                                ${tagsHtml ? `<span class="post-tags">${tagsHtml}</span>` : ""}
                            </div>
                        </div>
                        <div class="post-body">${parseMarkdown(md)}</div>
                    `;
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                        postContainer.style.transition = "opacity 0.35s ease";
                        postContainer.style.opacity = "1";
                    }));
                })
                .catch(err => {
                    console.error("Blog: failed to load post", err);
                    postContainer.innerHTML = `<p class="blog-error">Could not load post "<strong>${slug}</strong>". Make sure <code>blog/posts/${slug}.md</code> exists in your repo.</p>
                        <a class="post-back" href="index.html">← Back to Blog</a>`;
                });
        }
    }
})();