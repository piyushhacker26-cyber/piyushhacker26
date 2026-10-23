
"use strict";

/* =====================================
   WEBSITE CONFIGURATION
===================================== */

const CONFIG = {
  instagramUsername: "Piyushkumawat_26"
};

/* =====================================
   ELEMENTS
===================================== */

const form = document.getElementById("followForm");
const submitButton = document.getElementById("submitButton");
const statusMessage = document.getElementById("statusMessage");

/* =====================================
   USERNAME HELPERS
===================================== */

function getUsername() {
  return CONFIG.instagramUsername
    .trim()
    .replace(/^@/, "");
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9._]{1,30}$/.test(username)
    && username !== "YOUR_USERNAME";
}

/* =====================================
   AUTOMATIC AVATAR GENERATOR
   No API, image upload or backend required
===================================== */

function hashString(value) {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function escapeXml(value) {
  return value.replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;"
    };

    return entities[character];
  });
}

function makeAvatar(username) {
  const name = username.replace(/^@/, "") || "IG";
  const hash = hashString(name.toLowerCase());

  const hue1 = hash % 360;
  const hue2 = (hue1 + 75 + (hash % 100)) % 360;

  const initials = escapeXml(
    name
      .split(/[._\s-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join("") || "IG"
  );

  const circleX = 25 + (hash % 50);
  const circleY = 25 + ((hash >>> 5) % 50);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g"
                        x1="0" y1="0"
                        x2="1" y2="1">
          <stop offset="0%"
                stop-color="hsl(${hue1}, 85%, 58%)"/>
          <stop offset="100%"
                stop-color="hsl(${hue2}, 80%, 38%)"/>
        </linearGradient>
      </defs>

      <rect width="100" height="100" rx="50" fill="url(#g)"/>

      <circle cx="${circleX}"
              cy="${circleY}"
              r="34"
              fill="#ffffff"
              opacity=".12"/>

      <circle cx="15"
              cy="85"
              r="28"
              fill="#ffffff"
              opacity=".10"/>

      <circle cx="82"
              cy="15"
              r="15"
              fill="#ffffff"
              opacity=".12"/>

      <text x="50"
            y="55"
            text-anchor="middle"
            dominant-baseline="middle"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${initials.length > 1 ? 30 : 38}"
            font-weight="800"
            fill="#ffffff">${initials}</text>
    </svg>
  `;

  return "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg);
}

/* =====================================
   INITIALIZE SOCIAL PROFILE CARDS
===================================== */

function initializeCards() {
  const username = getUsername();
  const validUsername = isValidUsername(username);

  const cards = document.querySelectorAll(
    ".social-card[data-required='true']"
  );

  cards.forEach(card => {
    const avatar = card.querySelector("[data-avatar]");
    const usernameElement = card.querySelector("[data-username]");
    const followLink = card.querySelector("[data-follow-link]");

    if (avatar && usernameElement && followLink) {
      usernameElement.textContent = "@" + username;

      avatar.innerHTML = "";

      const image = document.createElement("img");

      image.src = makeAvatar(username);
      image.alt = "";
      image.width = 58;
      image.height = 58;
      image.style.width = "100%";
      image.style.height = "100%";
      image.style.objectFit = "cover";

      avatar.appendChild(image);

      if (validUsername) {
        followLink.href =
          "https://www.instagram.com/" +
          encodeURIComponent(username) +
          "/";
      } else {
        followLink.href = "#";
        followLink.setAttribute("aria-disabled", "true");
      }
    }
  });
}

/* =====================================
   VALIDATION
===================================== */

function getRequiredCheckboxes() {
  return Array.from(
    document.querySelectorAll(
      ".social-card[data-required='true'] .confirm-checkbox"
    )
  );
}

function allConfirmed() {
  const checkboxes = getRequiredCheckboxes();

  return checkboxes.length > 0 &&
    checkboxes.every(checkbox => checkbox.checked);
}

function showMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = "status-message is-" + type;
}

function clearMessage() {
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
}

/* =====================================
   UPDATE CONFIRMATION STATE
===================================== */

function updateState() {
  const checkboxes = getRequiredCheckboxes();

  checkboxes.forEach(checkbox => {
    const card = checkbox.closest(".social-card");
    const followButton = card?.querySelector("[data-follow-link]");

    if (!followButton) return;

    const confirmed = checkbox.checked;

    followButton.classList.toggle(
      "is-confirmed",
      confirmed
    );

    followButton.textContent = confirmed
      ? "Confirmed ✓"
      : "Follow";

    followButton.setAttribute(
      "aria-label",
      confirmed
        ? "Follow confirmation checked"
        : "Open Instagram profile"
    );
  });

  submitButton.disabled = !allConfirmed();

  clearMessage();
}

/* =====================================
   FOLLOW LINK HANDLER
===================================== */

document.addEventListener("click", event => {
  const link = event.target.closest("[data-follow-link]");

  if (!link) return;

  if (link.getAttribute("aria-disabled") === "true") {
    event.preventDefault();

    showMessage(
      "Please set a valid Instagram username in script.js.",
      "error"
    );
  }
});

/* =====================================
   CHECKBOX EVENTS
===================================== */

form.addEventListener("change", event => {
  if (event.target.matches(".confirm-checkbox")) {
    updateState();
  }
});

/* =====================================
   SUBMIT VALIDATION
===================================== */

form.addEventListener("submit", event => {
  event.preventDefault();

  const username = getUsername();

  if (!isValidUsername(username)) {
    submitButton.disabled = true;

    showMessage(
      "Please set your Instagram username in script.js before submitting.",
      "error"
    );

    return;
  }

  if (!allConfirmed()) {
    submitButton.disabled = true;

    showMessage(
      "Submission rejected. Please confirm every required social media account.",
      "error"
    );

    return;
  }

  showMessage(
    "Confirmation successful! You have reported that you followed all required accounts. This has not been independently verified or saved to a server.",
    "success"
  );
});

/* =====================================
   START WEBSITE
===================================== */

initializeCards();
updateState();
