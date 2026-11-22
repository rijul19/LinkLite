
const generatorForm = document.getElementById("urlForm");
const urlInput = document.getElementById("originalUrl");
const generatorMessage = document.getElementById("formMessage");

const API_URL = "http://localhost:5000/api/urls";

let resultContainer = null;

// Display the real short URL
function displayShortURL(result) {
    if (!resultContainer) {
        resultContainer = document.createElement("div");
        resultContainer.id = "shortUrlResult";
        resultContainer.className = "short-url-result";
        generatorForm.appendChild(resultContainer);
    }

    resultContainer.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "Your short link is ready!";

    const shortURLText = document.createElement("p");
    const shortURLLink = document.createElement("a");

    shortURLLink.href = result.shortURL;
    shortURLLink.textContent = result.shortURL;
    shortURLLink.target = "_blank";
    shortURLLink.rel = "noopener noreferrer";

    shortURLText.appendChild(shortURLLink);

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Copy Link";

    copyButton.addEventListener("click", async function () {
        try {
            await navigator.clipboard.writeText(result.shortURL);
            copyButton.textContent = "Copied!";

            setTimeout(function () {
                copyButton.textContent = "Copy Link";
            }, 2000);

        } catch (error) {
            copyButton.textContent = "Copy manually";
        }
    });

    resultContainer.append(heading, shortURLText, copyButton);
}

// Listen for successful URL validation
if (generatorForm) {
    generatorForm.addEventListener("urlValidated", async function (event) {
        const originalUrl = event.detail.originalUrl;

        generatorMessage.textContent = "Creating your short link...";
        generatorMessage.className = "form-message success";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    originalUrl: originalUrl
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to create short link.");
            }

            const urlData = result.data;

            const savedResult = {
                originalURL: urlData.originalUrl,
                shortCode: urlData.shortCode,
                shortURL: urlData.shortUrl,
                clicks: urlData.clicks || 0,
                createdAt: new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })
            };

            displayShortURL(savedResult);

            if (typeof saveHistory === "function") {
                saveHistory(savedResult);
            }

            generatorMessage.textContent = "Short link created successfully!";
            generatorMessage.className = "form-message success";

            console.log("Short URL created:", savedResult);

        } catch (error) {
            console.error("URL generation error:", error);

            generatorMessage.textContent =
                error.message || "Something went wrong. Please try again.";

            generatorMessage.className = "form-message error";
        }
    });
}

// Remove old result when user changes the URL
if (urlInput) {
    urlInput.addEventListener("input", function () {
        if (resultContainer) {
            resultContainer.remove();
            resultContainer = null;
        }
    });
}
