const githubUsername = "Jdrc6000";

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