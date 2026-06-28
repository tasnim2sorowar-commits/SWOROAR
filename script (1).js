/* =========================================================
   EDIT THIS PART: add, remove, or change your friends here.
   - name: their name
   - note: a short line about them (shown when you click the photo)
   - color: hex color for their placeholder photo circle
   - photo: (optional) path to a real image, e.g. "images/maya.jpg"
            leave it as "" to use the colored initials placeholder
   Tip: once your site is live, you can also edit names/notes/photos
   right on the page using Edit mode (top-right button) instead of
   touching this file.
   ========================================================= */
const friends = [
  { name: "Maya", note: "My lab partner who somehow always finds the snacks before anyone else.", color: "#c1432f", photo: "images/maya.jpg" },
  { name: "Diego", note: "Will quote a movie at you mid-conversation and not break eye contact.", color: "#7c8b6f", photo: "images/diego.jpg" },
  { name: "Aisha", note: "The only person who actually reads the group chat messages.", color: "#3f6b8a", photo: "images/aisha.jpg" },
  { name: "Leo", note: "Has lost three umbrellas this semester. Still optimistic about umbrellas.", color: "#b9885c", photo: "images/leo.jpg" },
  { name: "Priya", note: "Makes the best chai and the worst puns, in roughly equal measure.", color: "#8a5a8c", photo: "images/priya.jpg" },
  { name: "Sam", note: "Will absolutely beat you at chess and then explain how, politely.", color: "#4f7d5c", photo: "images/sam.jpg" },
];

/* =========================================================
   EDIT LOGIN
   Change these if you want a different username/password.
   NOTE: this is NOT real security — anyone who views the page
   source can read these values. It only stops casual visitors
   from clicking "Edit," it can't stop a determined person.
   ========================================================= */
const EDIT_USERNAME = "Sworoar";
const EDIT_PASSWORD = "1234";

/* Edits made through the Edit panel (photos AND text) are saved
   with localStorage, which only lives in the browser that made
   them. Other visitors to your live site will NOT see these
   changes unless you also edit script.js / index.html directly
   and re-upload to GitHub. */
const STORAGE_KEY = "friend-wall-overrides";       // per-friend edits, keyed by index
const INTRO_STORAGE_KEY = "friend-wall-intro-overrides"; // your own intro edits

let editMode = false;

/* ---------- Friend overrides (photo / name / note) ---------- */
function getOverrides() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveOverride(index, field, value) {
  const overrides = getOverrides();
  overrides[index] = { ...overrides[index], [field]: value };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    return true;
  } catch (e) {
    return false;
  }
}

function clearAllOverrides() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(INTRO_STORAGE_KEY);
}

function photoFor(friend, index) {
  const o = getOverrides()[index];
  return (o && o.photo) || friend.photo;
}
function nameFor(friend, index) {
  const o = getOverrides()[index];
  return (o && o.name) || friend.name;
}
function noteFor(friend, index) {
  const o = getOverrides()[index];
  return (o && o.note) || friend.note;
}

/* ---------- Intro overrides (your own name / bio / photo) ---------- */
function getIntroOverrides() {
  try {
    return JSON.parse(localStorage.getItem(INTRO_STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveIntroOverride(field, value) {
  const o = getIntroOverrides();
  o[field] = value;
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, JSON.stringify(o));
    return true;
  } catch (e) {
    return false;
  }
}

/* ---------- Image compression (used for any uploaded photo) ---------- */
function resizeImage(file, maxDimension, quality, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

/* ---------- Render the friend wall ---------- */
function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderFriends() {
  const grid = document.getElementById("friend-grid");
  grid.innerHTML = "";

  friends.forEach((friend, index) => {
    const photo = photoFor(friend, index);
    const name = nameFor(friend, index);
    const note = noteFor(friend, index);

    const card = document.createElement("div");
    card.className = "polaroid";

    const photoHTML = photo
      ? `<img class="photo" src="${photo}" alt="${name}" style="object-fit:cover;" onerror="this.outerHTML='<div class=&quot;photo&quot; style=&quot;background:${friend.color}&quot;>${initials(name)}</div>'" />`
      : `<div class="photo" style="background:${friend.color}">${initials(name)}</div>`;

    if (editMode) {
      card.innerHTML = `
        ${photoHTML}
        <button type="button" class="change-photo-btn" data-index="${index}">📷 change photo</button>
        <input type="text" class="edit-field name-field" data-index="${index}" data-field="name" value="${name}" />
        <textarea class="edit-field note-field" data-index="${index}" data-field="note">${note}</textarea>
      `;
      card.querySelector(".change-photo-btn").addEventListener("click", () => openFilePickerFor(index));
      card.querySelector(".name-field").addEventListener("blur", handleTextEdit);
      card.querySelector(".note-field").addEventListener("blur", handleTextEdit);
    } else {
      card.innerHTML = `
        <div class="card-tap" tabindex="0" role="button" aria-label="Open note about ${name}">
          ${photoHTML}
          <p class="name">${name}</p>
          <p class="note-preview">tap for the note ✨</p>
        </div>
      `;
      const tap = card.querySelector(".card-tap");
      tap.addEventListener("click", () => openLightbox(name, note, photo, friend.color));
      tap.addEventListener("keydown", (e) => {
        if (e.key === "Enter") openLightbox(name, note, photo, friend.color);
      });
    }

    grid.appendChild(card);
  });
}

function handleTextEdit(e) {
  const index = e.target.getAttribute("data-index");
  const field = e.target.getAttribute("data-field");
  const ok = saveOverride(index, field, e.target.value);
  if (!ok) alert("Couldn't save that change — your browser's storage might be full.");
}

/* ---------- Photo upload: friends ---------- */
const photoInput = document.getElementById("photo-input");
let pendingTarget = null; // { type: "friend", index } or { type: "intro" }

function openFilePickerFor(index) {
  pendingTarget = { type: "friend", index };
  photoInput.value = "";
  photoInput.click();
}

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file || !pendingTarget) return;

  resizeImage(file, 480, 0.8, (dataUrl) => {
    let ok;
    if (pendingTarget.type === "intro") {
      ok = saveIntroOverride("photo", dataUrl);
      if (ok) applyIntroOverrides();
    } else {
      ok = saveOverride(pendingTarget.index, "photo", dataUrl);
      if (ok) renderFriends();
    }
    if (!ok) {
      alert(
        "That photo is still too large to save in this browser, even after shrinking it.\n\n" +
        "Try a different photo, or use the GitHub upload method instead (see the README) " +
        "for photos everyone can see."
      );
    }
  });
});

/* ---------- Intro section: editable name / bio / photo ---------- */
const myNameEl = document.getElementById("my-name");
const myBioEl = document.getElementById("my-bio");
const mePhotoEl = document.getElementById("me-photo");
const changeMePhotoBtn = document.getElementById("change-me-photo");

function applyIntroOverrides() {
  const o = getIntroOverrides();
  if (o.name) myNameEl.textContent = o.name;
  if (o.bio) myBioEl.textContent = o.bio;
  if (o.photo) {
    mePhotoEl.innerHTML = `<img src="${o.photo}" alt="Me" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
    mePhotoEl.style.background = "transparent";
  }
}

function setIntroEditable(on) {
  if (on) {
    myNameEl.contentEditable = "true";
    myBioEl.contentEditable = "true";
    myNameEl.classList.add("edit-field");
    myBioEl.classList.add("edit-field");
    changeMePhotoBtn.classList.remove("hidden");
  } else {
    myNameEl.contentEditable = "false";
    myBioEl.contentEditable = "false";
    myNameEl.classList.remove("edit-field");
    myBioEl.classList.remove("edit-field");
    changeMePhotoBtn.classList.add("hidden");
  }
}

myNameEl.addEventListener("blur", () => {
  const ok = saveIntroOverride("name", myNameEl.textContent.trim());
  if (!ok) alert("Couldn't save your name — storage might be full.");
});
myBioEl.addEventListener("blur", () => {
  const ok = saveIntroOverride("bio", myBioEl.textContent.trim());
  if (!ok) alert("Couldn't save your bio — storage might be full.");
});
changeMePhotoBtn.addEventListener("click", () => {
  pendingTarget = { type: "intro" };
  photoInput.value = "";
  photoInput.click();
});

/* ---------- Edit mode + login ---------- */
const editToggleBtn = document.getElementById("edit-toggle");
const editBanner = document.getElementById("edit-banner");
const exitEditBtn = document.getElementById("exit-edit");
const resetAllBtn = document.getElementById("reset-photos");

const loginModal = document.getElementById("login-modal");
const loginClose = document.getElementById("login-close");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginSubmit = document.getElementById("login-submit");
const loginError = document.getElementById("login-error");

editToggleBtn.addEventListener("click", () => {
  if (editMode) {
    exitEditMode();
  } else {
    loginError.classList.add("hidden");
    loginUsername.value = "";
    loginPassword.value = "";
    loginModal.classList.remove("hidden");
    loginUsername.focus();
  }
});

loginClose.addEventListener("click", () => loginModal.classList.add("hidden"));
loginModal.addEventListener("click", (e) => {
  if (e.target === loginModal) loginModal.classList.add("hidden");
});

loginSubmit.addEventListener("click", attemptLogin);
loginPassword.addEventListener("keydown", (e) => {
  if (e.key === "Enter") attemptLogin();
});

function attemptLogin() {
  if (loginUsername.value === EDIT_USERNAME && loginPassword.value === EDIT_PASSWORD) {
    loginModal.classList.add("hidden");
    enterEditMode();
  } else {
    loginError.classList.remove("hidden");
  }
}

function enterEditMode() {
  editMode = true;
  editBanner.classList.remove("hidden");
  editToggleBtn.textContent = "✏️ Editing…";
  setIntroEditable(true);
  renderFriends();
}

function exitEditMode() {
  editMode = false;
  editBanner.classList.add("hidden");
  editToggleBtn.textContent = "✏️ Edit";
  setIntroEditable(false);
  renderFriends();
}

exitEditBtn.addEventListener("click", exitEditMode);
resetAllBtn.addEventListener("click", () => {
  if (confirm("Remove every edit you've made in this browser (photos, names, notes, intro) and go back to the defaults?")) {
    clearAllOverrides();
    location.reload();
  }
});

/* ---------- Lightbox ---------- */
const lightbox = document.getElementById("lightbox");
const lightboxPhoto = document.getElementById("lightbox-photo");
const lightboxName = document.getElementById("lightbox-name");
const lightboxNote = document.getElementById("lightbox-note");
const closeBtn = document.getElementById("lightbox-close");

function openLightbox(name, note, photo, color) {
  lightboxName.textContent = name;
  lightboxNote.textContent = note;

  if (photo) {
    lightboxPhoto.innerHTML = `<img src="${photo}" alt="${name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
    lightboxPhoto.style.background = "transparent";
  } else {
    lightboxPhoto.innerHTML = initials(name);
    lightboxPhoto.style.background = color;
  }

  lightbox.classList.remove("hidden");
}

function closeLightbox() {
  lightbox.classList.add("hidden");
}

closeBtn.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLightbox();
    loginModal.classList.add("hidden");
  }
});

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Go ---------- */
applyIntroOverrides();
renderFriends();
