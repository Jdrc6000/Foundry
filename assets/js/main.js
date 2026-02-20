// Replace these with your GitHub username and repos
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
                data.slice(0, 5).forEach(commit => { // latest 5 commits
                    const li = document.createElement("li");
                    li.textContent = commit.commit.message;
                    ul.appendChild(li);
                });
                projectItem.appendChild(ul);
                projectsList.appendChild(projectItem);
            });
    });
}

// Photo gallery (optional: dynamic loading)
const photoGrid = document.getElementById("photo-grid");
if (photoGrid) {
    const photos = ["sample.jpg", "sample.jpg"]; // add more filenames
    photos.forEach(filename => {
        const img = document.createElement("img");
        img.src = `../assets/images/${filename}`;
        img.alt = "Photo";
        photoGrid.appendChild(img);
    });
}