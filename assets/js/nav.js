// Auto-highlight the current page's nav link
(function () {
    const links = document.querySelectorAll("header nav a");
    const current = window.location.pathname.split("/").pop() || "index.html";

    links.forEach(link => {
        const href = link.getAttribute("href").split("/").pop();
        if (href === current) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
})();