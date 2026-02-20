const githubUsername = "Jdrc6000";
const repos = ["forge"]; // Add more repos as needed

// Projects list
const projectsList = document.getElementById("projects-list");
if (projectsList) {
    repos.forEach(repo => {
        fetch(`https://api.github.com/repos/${githubUsername}/${repo}/commits`)
            .then(res => res.json())
            .then(data => {
                const projectItem = document.createElement("li");
                projectItem.innerHTML = `<h3>${repo}</h3>`;
                const ul = document.createElement("ul");
                data.slice(0, 5).forEach(commit => {
                    const li = document.createElement("li");
                    li.textContent = commit.commit.message;
                    ul.appendChild(li);
                });
                projectItem.appendChild(ul);
                projectsList.appendChild(projectItem);
            });
    });
}

// Fully automatic GitHub-powered gallery
const photoGrid = document.getElementById("photo-grid");

if (photoGrid) {
    const githubUsername = "Jdrc6000";
    const repoName = "forge"; // change if this site is in another repo
    const imagesPath = "assets/images";

    fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/${imagesPath}`)
        .then(res => res.json())
        .then(files => {
            files
                .filter(file => file.type === "file" && file.name.match(/\.(jpg|jpeg|png|webp)$/i))
                .forEach(file => {
                    const figure = document.createElement("figure");

                    const img = document.createElement("img");
                    img.src = file.download_url;
                    img.alt = file.name.replace(/\.[^/.]+$/, "");

                    const caption = document.createElement("figcaption");
                    caption.textContent = file.name.replace(/\.[^/.]+$/, "");

                    figure.appendChild(img);
                    figure.appendChild(caption);
                    photoGrid.appendChild(figure);
                });
        })
        .catch(err => {
            console.error("Failed to load images:", err);
        });
}

// Featured project on home page
const featuredProject = document.getElementById("featured-project");
if (featuredProject && repos.length > 0) {
    fetch(`https://api.github.com/repos/${githubUsername}/${repos[0]}/commits`)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                featuredProject.innerHTML = `
                    <h3>${repos[0]}</h3>
                    <p>Latest commit: ${data[0].commit.message}</p>
                    <p>Date: ${new Date(data[0].commit.author.date).toLocaleDateString()}</p>
                `;
            }
        });
}