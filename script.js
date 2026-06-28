/* =========================================================
   EDIT THIS PART: add, remove, or change your friends here.
   - name: their name
   - note: a short line about them (shown when you click the photo)
   - color: hex color for their placeholder photo circle
   - photo: (optional) path to a real image, e.g. "images/maya.jpg"
            leave it as "" to use the colored initials placeholder
   ========================================================= */
const friends = [
  { name: "Maya", note: "My lab partner who somehow always finds the snacks before anyone else.", color: "#c1432f", photo: "" },
  { name: "Diego", note: "Will quote a movie at you mid-conversation and not break eye contact.", color: "#7c8b6f", photo: "" },
  { name: "Aisha", note: "The only person who actually reads the group chat messages.", color: "#3f6b8a", photo: "" },
  { name: "Leo", note: "Has lost three umbrellas this semester. Still optimistic about umbrellas.", color: "#b9885c", photo: "" },
  { name: "Priya", note: "Makes the best chai and the worst puns, in roughly equal measure.", color: "#8a5a8c", photo: "" },
  { name: "Sam", note: "Will absolutely beat you at chess and then explain how, politely.", color: "#4f7d5c", photo: "" },
];

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
    const card = document.createElement("button");
    card.className = "polaroid";
    card.setAttribute("type", "button");
    card.setAttribute("aria-label", `Open note about ${friend.name}`);

    const photoHTML = friend.photo
      ? `<img class="photo" src="${friend.photo}" alt="${friend.name}" style="object-fit:cover;" />`
      : `<div class="photo" style="background:${friend.color}">${initials(friend.name)}</div>`;

    card.innerHTML = `
      ${photoHTML}
      <p class="name">${friend.name}</p>
      <p class="note-preview">tap for the note ✨</p>
    `;

    card.addEventListener("click", () => openLightbox(friend));
    grid.appendChild(card);
  });
}

/* ---------- Lightbox ---------- */
const lightbox = document.getElementById("lightbox");
const lightboxPhoto = document.getElementById("lightbox-photo");
const lightboxName = document.getElementById("lightbox-name");
const lightboxNote = document.getElementById("lightbox-note");
const closeBtn = document.getElementById("lightbox-close");

function openLightbox(friend) {
  lightboxName.textContent = friend.name;
  lightboxNote.textContent = friend.note;

  if (friend.photo) {
    lightboxPhoto.innerHTML = `<img src="${friend.photo}" alt="${friend.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
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
  if (e.key === "Escape") closeLightbox();
});

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Go ---------- */
renderFriends();
