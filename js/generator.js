
const generatorForm = document.getElementById("urlForm");
const urlInput = document.getElementById("originalUrl");
const generatorMessage = document.getElementById("formMessage");


let resultContainer = null;

function generateShortCode(length = 6) {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let shortCode = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(
            Math.random() * characters.length
        );

        shortCode += characters[randomIndex];
    }

    return shortCode;
}


function generateShortURL(originalURL) {
    const shortCode = generateShortCode();

    return {
        originalURL: originalURL,
        shortCode: shortCode,
        shortURL: `https://linklite.demo/${shortCode}`
    };
}



function displayShortURL(result) {

    if (!resultContainer) {
        resultContainer = document.createElement("div");

        resultContainer.id = "shortUrlResult";
        resultContainer.className = "short-url-result";

        resultContainer.style.marginTop = "20px";
        resultContainer.style.padding = "18px";
        resultContainer.style.border = "1px solid #d1d5db";
        resultContainer.style.borderRadius = "12px";
        resultContainer.style.backgroundColor = "#f9fafb";

        generatorForm.appendChild(resultContainer);
    }

 
    resultContainer.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "Your demo short link is ready!";
    heading.style.fontSize = "18px";
    heading.style.color = "#1f2937";
    heading.style.margin = "0 0 12px";

    const shortURLText = document.createElement("p");
    shortURLText.textContent = result.shortURL;
    shortURLText.style.color = "#4f46e5";
    shortURLText.style.fontWeight = "600";
    shortURLText.style.overflowWrap = "anywhere";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Copy Link";

    copyButton.style.padding = "10px 16px";
    copyButton.style.border = "none";
    copyButton.style.borderRadius = "8px";
    copyButton.style.backgroundColor = "#4f46e5";
    copyButton.style.color = "#ffffff";
    copyButton.style.cursor = "pointer";

    copyButton.addEventListener("click", async function () {
        try {
            await navigator.clipboard.writeText(result.shortURL);

            copyButton.textContent = "Copied!";

            setTimeout(function () {
                copyButton.textContent = "Copy Link";
            }, 2000);

        } catch (error) {
            
            copyButton.textContent = "Copy manually";

            shortURLText.textContent =
                "Select and copy this link: " + result.shortURL;
        }
    });


    resultContainer.appendChild(heading);
    resultContainer.appendChild(shortURLText);
    resultContainer.appendChild(copyButton);
}


generatorForm.addEventListener("urlValidated", function (event) {

    const originalURL = event.detail.originalUrl;

    const result = generateShortURL(originalURL);

    displayShortURL(result);
    saveHistory(result);

  
    generatorMessage.textContent =
        "Demo short link generated successfully!";

    generatorMessage.className = "form-message success";

    console.log("Original URL:", result.originalURL);
    console.log("Short code:", result.shortCode);
    console.log("Demo short URL:", result.shortURL);
});




urlInput.addEventListener("input", function () {
    if (resultContainer) {
        resultContainer.remove();
        resultContainer = null;
    }
});
