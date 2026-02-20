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

// Photo gallery (dynamic)
const photoGrid = document.getElementById("photo-grid");
if (photoGrid) {
    const photos = ["sample.jpg", "sample.jpg", "sample.jpg"];
    photos.forEach(filename => {
        const img = document.createElement("img");
        img.src = `../assets/images/${filename}`;
        img.alt = "Photo";
        photoGrid.appendChild(img);
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