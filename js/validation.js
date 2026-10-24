
const urlForm = document.getElementById("urlForm");
const originalUrlInput = document.getElementById("originalUrl");
const formMessage = document.getElementById("formMessage");

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = "form-message " + type;
}

function validateURL(input) {
    const normalizedURL = input.trim();

    if (normalizedURL === "") {
        return {
            valid: false,
            message: "Please enter a URL."
        };
    }

    let parsedURL;

    try {
        parsedURL = new URL(normalizedURL);
    } catch {
        return {
            valid: false,
            message: "Please enter a valid URL, including https:// or http://."
        };
    }

    if (
        parsedURL.protocol !== "http:" &&
        parsedURL.protocol !== "https:"
    ) {
        return {
            valid: false,
            message: "Only HTTP and HTTPS URLs are allowed."
        };
    }

    if (!parsedURL.hostname.includes(".")) {
        return {
            valid: false,
            message: "Please enter a valid domain, such as example.com."
        };
    }

    if (
        parsedURL.hostname.startsWith(".") ||
        parsedURL.hostname.endsWith(".") ||
        parsedURL.hostname.includes("..")
    ) {
        return {
            valid: false,
            message: "Please check the domain name."
        };
    }

    return {
        valid: true,
        normalizedURL: parsedURL.href
    };
}

urlForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const userInput = originalUrlInput.value;
    const result = validateURL(userInput);

    if (!result.valid) {
        showMessage(result.message, "error");
        originalUrlInput.focus();
        return;
    }

    originalUrlInput.value = result.normalizedURL;

    showMessage(
        "URL is valid! Ready for short-link generation.",
        "success"
    );

    // Notify the generator module when the URL is valid.
    // Tishya's module can listen for this event later.
    urlForm.dispatchEvent(
        new CustomEvent("urlValidated", {
            bubbles: true,
            detail: {
                originalUrl: result.normalizedURL
            }
        })
    );
});

// Clear the old message when the user edits the input.
originalUrlInput.addEventListener("input", function () {
    formMessage.textContent = "";
    formMessage.className = "form-message";
});
