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
    const postsPath = "blog/posts";   // folder inside repo

    // Raw content base URL
    const raw = (path) =>
        `https://raw.githubusercontent.com/${githubUsername}/${repoName}/${branch}/${path}`;

    // Tiny Markdown → HTML renderer
    function parseMarkdown(md) {
        // Escape HTML entities first
        let html = md
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Fenced code blocks
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
            `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`
        );

        // Inline code
        html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

        // Headings
        html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
        html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
        html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
        html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
        html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
        html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

        // Blockquotes
        html = html.replace(/<\/blockquote>\n?<blockquote>/g, "<br>");

        // Horizontal rules
        html = html.replace(/^(-{3,}|\*{3,})$/gm, "<hr>");

        // Bold and italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
        html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
        html = html.replace(/_(.+?)_/g, "<em>$1</em>");

        // Images (before links)
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
            '<img src="$2" alt="$1">');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2">$1</a>');

        // Unordered lists (basic)
        html = html.replace(/^[\*\-] (.+)$/gm, "<li>$1</li>");
        html = html.replace(/(<li>.*<\/li>\n?)+/g, match => `<ul>${match}</ul>`);

        // Ordered lists
        html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

        // Paragraphs (lines not already wrapped in a block tag)
        html = html.split(/\n{2,}/).map(block => {
            block = block.trim();
            if (!block) return "";
            const blockTags = /^<(h[1-6]|ul|ol|li|pre|blockquote|hr|img)/;
            if (blockTags.test(block)) return block;
            return `<p>${block.replace(/\n/g, "<br>")}</p>`;
        }).join("\n");

        return html;
    }

    // Format date nicely
    function formatDate(dateStr) {
        const d = new Date(dateStr + "T12:00:00"); // avoid timezone shifting
        return d.toLocaleDateString(undefined, {
            year: "numeric", month: "long", day: "numeric"
        });
    }

    // Blog listing page
    const listEl = document.getElementById("posts-list");
    const countEl = document.getElementById("blog-count");

    if (listEl) {
        listEl.innerHTML = '<p class="blog-loading">Loading posts…</p>';

        fetch(raw(`${postsPath}/index.json`))
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(posts => {
                // Sort newest first
                posts.sort((a, b) => new Date(b.date) - new Date(a.date));
                if (countEl) {
                    countEl.textContent = `${posts.length} post${posts.length !== 1 ? "s" : ""}`;
                }
                listEl.innerHTML = "";
                posts.forEach(post => {
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
                    listEl.appendChild(li);
                });
            })
            .catch(err => {
                console.error("Blog: failed to load index", err);
                listEl.innerHTML = '<p class="blog-error">Could not load posts. Make sure <code>blog/posts/index.json</code> exists in your repo.</p>';
                if (countEl) countEl.textContent = "";
            });
    }

    // Post reader page
    const postContainer = document.getElementById("post-container");

    if (postContainer) {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get("slug");

        if (!slug) {
            postContainer.innerHTML = '<p class="blog-error">No post specified.</p>';
        } else {
            // Fetch the index to get metadata, then fetch the markdown
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
                    // Update page title
                    if (meta) document.title = `${meta.title} — Foundry`;

                    const tagsHtml = (meta?.tags || [])
                        .map(t => `<span class="tag">${t}</span>`)
                        .join("");

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
                })
                .catch(err => {
                    console.error("Blog: failed to load post", err);
                    postContainer.innerHTML = `<p class="blog-error">Could not load post "<strong>${slug}</strong>". Make sure <code>blog/posts/${slug}.md</code> exists in your repo.</p>
                        <a class="post-back" href="index.html">← Back to Blog</a>`;
                });
        }
    }
})();