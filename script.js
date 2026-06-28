/* =========================================================
   EDIT THIS PART: add, remove, or change your friends here.
   - name: their name
   - note: a short line about them (shown when you click the photo)
   - color: hex color for their placeholder photo circle
   - photo: (optional) path to a real image, e.g. "images/maya.jpg"
            leave it as "" to use the colored initials placeholder
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

/* Photos uploaded through the Edit panel are saved with
   localStorage, which only lives in the browser that uploaded
   them. Other visitors to your live site will NOT see them
   unless you also upload the actual image files to GitHub. */
const STORAGE_KEY = "friend-wall-photo-overrides";

let editMode = false;

function getOverrides() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveOverride(name, dataUrl) {
  const overrides = getOverrides();
  overrides[name] = dataUrl;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    return true;
  } catch (e) {
    return false;
  }
}

function clearOverrides() {
  localStorage.removeItem(STORAGE_KEY);
}

function photoFor(friend) {
  const overrides = getOverrides();
  return overrides[friend.name] || friend.photo;
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

  friends.forEach((friend) => {
    const photo = photoFor(friend);
    const card = document.createElement("div");
    card.className = "polaroid";

    const photoHTML = photo
      ? `<img class="photo" src="${photo}" alt="${friend.name}" style="object-fit:cover;" onerror="this.outerHTML='<div class=&quot;photo&quot; style=&quot;background:${friend.color}&quot;>${initials(friend.name)}</div>'" />`
      : `<div class="photo" style="background:${friend.color}">${initials(friend.name)}</div>`;

    const editControl = editMode
      ? `<button type="button" class="change-photo-btn" data-name="${friend.name}">📷 change photo</button>`
      : "";

    card.innerHTML = `
      <div class="card-tap" tabindex="0" role="button" aria-label="Open note about ${friend.name}">
        ${photoHTML}
        <p class="name">${friend.name}</p>
        <p class="note-preview">tap for the note ✨</p>
      </div>
      ${editControl}
    `;

    card.querySelector(".card-tap").addEventListener("click", () => openLightbox(friend));
    card.querySelector(".card-tap").addEventListener("keydown", (e) => {
      if (e.key === "Enter") openLightbox(friend);
    });

    if (editMode) {
      card.querySelector(".change-photo-btn").addEventListener("click", () => {
        openFilePickerFor(friend.name);
      });
    }

    grid.appendChild(card);
  });
}

/* ---------- Photo upload (edit mode) ---------- */
const photoInput = document.getElementById("photo-input");
let pendingFriendName = null;

function openFilePickerFor(name) {
  pendingFriendName = name;
  photoInput.value = "";
  photoInput.click();
}

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file || !pendingFriendName) return;
  resizeImage(file, 480, 0.8, (dataUrl) => {
    const ok = saveOverride(pendingFriendName, dataUrl);
    if (ok) {
      renderFriends();
    } else {
      alert(
        "That photo is still too large to save in this browser, even after shrinking it.\n\n" +
        "Try a different photo, or use the GitHub upload method instead (see the README) " +
        "for photos everyone can see."
      );
    }
  });
});

/* Shrinks an image to maxDimension (longest side, in px) and re-encodes
   it as a compressed JPEG, so it takes up far less storage space. */
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

/* ---------- Edit mode + login ---------- */
const editToggleBtn = document.getElementById("edit-toggle");
const editBanner = document.getElementById("edit-banner");
const exitEditBtn = document.getElementById("exit-edit");
const resetPhotosBtn = document.getElementById("reset-photos");

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
  renderFriends();
}

function exitEditMode() {
  editMode = false;
  editBanner.classList.add("hidden");
  editToggleBtn.textContent = "✏️ Edit";
  renderFriends();
}

exitEditBtn.addEventListener("click", exitEditMode);
resetPhotosBtn.addEventListener("click", () => {
  if (confirm("Remove all photos you've uploaded in this browser and go back to the default images?")) {
    clearOverrides();
    renderFriends();
  }
});

/* ---------- Lightbox ---------- */
const lightbox = document.getElementById("lightbox");
const lightboxPhoto = document.getElementById("lightbox-photo");
const lightboxName = document.getElementById("lightbox-name");
const lightboxNote = document.getElementById("lightbox-note");
const closeBtn = document.getElementById("lightbox-close");

function openLightbox(friend) {
  const photo = photoFor(friend);
  lightboxName.textContent = friend.name;
  lightboxNote.textContent = friend.note;

  if (photo) {
    lightboxPhoto.innerHTML = `<img src="${photo}" alt="${friend.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
    lightboxPhoto.style.background = "transparent";
  } else {
    lightboxPhoto.innerHTML = initials(friend.name);
    lightboxPhoto.style.background = friend.color;
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
renderFriends();
