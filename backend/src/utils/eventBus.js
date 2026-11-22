
const EventEmitter = require("events");

// Create a reusable event emitter
const eventBus = new EventEmitter();

// Set maximum listeners
eventBus.setMaxListeners(20);

// Listen for URL creation events
eventBus.on("url:created", (urlData) => {
    console.log(
        `[EVENT] URL created successfully: ${urlData.shortCode}`
    );
});

// Listen for URL deletion events
eventBus.on("url:deleted", (urlData) => {
    console.log(
        `[EVENT] URL deleted successfully: ${urlData.shortCode}`
    );
});

// Listen for URL click events
eventBus.on("url:clicked", (urlData) => {
    console.log(
        `[EVENT] Short URL clicked: ${urlData.shortCode}`
    );
});

// Handle event listener errors
eventBus.on("error", (error) => {
    console.error(
        "[EVENT ERROR]",
        error.message
    );
});

module.exports = eventBus;
