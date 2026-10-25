# 🔗 LinkLite — Smart URL Shortener

**LinkLite is a frontend URL shortener prototype** built using HTML, CSS, and JavaScript. It allows users to generate simulated short links, copy them, manage their link history, and view statistics through a simple, responsive interface.

## 🛠️ Tech Stack

- **HTML5** — Structures the website, input forms, buttons, history, and statistics sections.
- **CSS3** — Styles the interface, layouts, buttons, and responsive design.
- **JavaScript** — Handles URL validation, short-code generation, link management, click tracking, and statistics.
- **DOM Manipulation** — Dynamically updates links, messages, history entries, and statistics.
- **JavaScript Events** — Handles form submissions, button clicks, copying links, and deleting entries.
- **Local Storage** — Saves link history and click counts in the browser.
- **Clipboard API** — Allows users to copy generated short links.
- **Browser DevTools** — Helps inspect elements and debug errors.
- **Git & GitHub** — Supports version control and collaborative development.
- **GitHub Pages** — Hosts the static frontend website.

## ✨ Features & Functionality

### 1. URL Input & Validation
- Accepts long URLs through an input form.
- **Validates empty inputs and URL formats.**
- Trims unnecessary spaces from input.
- **Displays success and error messages dynamically.**

### 2. Short-Link Generation
- **Generates a unique demo short code** for each valid URL.
- Creates a simulated short link associated with the original URL.
- Stores the original URL, short code, and generated short link together.
- Displays the generated link dynamically.

### 3. Copy Link
- **Copies generated short links using the Clipboard API.**
- Displays feedback when copying succeeds or fails.

### 4. Link History
- **Displays previously generated links.**
- Saves link history using Local Storage.
- **Restores saved links after a page refresh.**
- Allows users to delete individual links.
- Displays a message when the history is empty.

### 5. Click Tracking
- **Maintains click counts using JavaScript.**
- Stores click-count data in Local Storage.
- Displays recorded click statistics for the current browser.

### 6. Statistics Dashboard
- **Displays the total number of generated links.**
- **Calculates and displays recorded clicks.**
- Updates statistics when links are generated or deleted, where applicable.

### 7. Responsive UI
- **Provides a clean, user-friendly interface.**
- Uses CSS to adapt the layout to different screen sizes.
- Organizes generated links, history, and statistics clearly.

### 8. Data Persistence
- **Stores link history and associated data in Local Storage.**
- Retains saved data across page refreshes unless browser storage is cleared.

## 📁 Project Structure

```text
LinkLite/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── generator.js
│   ├── history.js
│   └── statistics.js
├── assets/
└── README.md
```

- **`index.html`** — Main structure of the website.
- **`css/style.css`** — Website styling and responsive layout.
- **`js/main.js`** — Main application logic and event handling.
- **`js/generator.js`** — URL validation and short-link generation logic, depending on the implementation.
- **`js/history.js`** — Link history, deletion, and Local Storage management.
- **`js/statistics.js`** — Displays link and click statistics.
- **`assets/`** — Stores project assets, such as images and logos.
- **`README.md`** — Project documentation and setup instructions.

*Note: Adjust the filenames and folders to match your actual repository structure.*

## ⚙️ How It Works

1. **Enter a URL** in the input field.
2. JavaScript validates and normalizes the input.
3. **A unique short code and simulated short link are generated.**
4. The generated link is displayed and can be copied.
5. **Link information is saved in Local Storage.**
6. Users can view or delete saved links in the history section.
7. **The statistics dashboard displays generated-link totals and recorded clicks.**

## 🔒 Privacy

- **Link history and click statistics are stored locally in the browser.**
- Data is not automatically synchronized between different devices or browsers.
- Clearing browser data may permanently remove saved links and statistics.
- **Avoid storing sensitive or confidential URLs** in the application.
- The frontend prototype does not provide centralized user accounts or database-backed data storage.

## 🚀 Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/rijul19/LinkLite.git
   ```

2. **Navigate to the project folder:**

   ```bash
   cd LinkLite
   ```

3. **Open `index.html`** in your browser, or use a local development server.

### Deploy with GitHub Pages

1. Push the project to a GitHub repository.
2. Open the repository's **Settings**.
3. Select **Pages**.
4. Choose the appropriate branch and root folder.
5. Save the settings and open the published website.

**Note:** Test the generated links on the deployed website to verify that the client-side routing and redirect logic work as intended.

## 🔮 Future Improvements

- **Backend-powered URL shortening and redirection**
- **Centralized click tracking and analytics**
- **Cross-device link synchronization**
- Custom short URLs
- QR code generation
- Link expiration options
- Improved link validation and error handling
- Enhanced accessibility and responsive design
---

**Built with ❤️ using HTML, CSS, and JavaScript.**
