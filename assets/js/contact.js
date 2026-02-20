(function () {
    const form = document.getElementById("contact-form");
    const btn = document.getElementById("submit-btn");
    const status = document.getElementById("form-status");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Loading state
        btn.disabled = true;
        btn.classList.add("is-sending");
        status.textContent = "";
        status.className = "form-status";

        const data = new FormData(form);

        fetch(form.action, {
            method: "POST",
            body: data,
            headers: { Accept: "application/json" }
        })
            .then(res => {
                if (res.ok) {
                    status.textContent = "Message sent — thanks! I'll get back to you soon.";
                    status.classList.add("success");
                    form.reset();
                } else {
                    return res.json().then(body => {
                        throw new Error(
                            (body.errors || []).map(e => e.message).join(", ") ||
                            "Something went wrong."
                        );
                    });
                }
            })
            .catch(err => {
                status.textContent = err.message || "Could not send message. Please try again.";
                status.classList.add("error");
            })
            .finally(() => {
                btn.disabled = false;
                btn.classList.remove("is-sending");
            });
    });
})();