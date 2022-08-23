import { getActiveTabURL } from "./utils.js";

const addNewBookmark = (bookmarks, bookmark) => {
  const bookmarkTitleE = document.createElement("div");
  const controlsE = document.createElement("div");
  const newBookmarkE = document.createElement("div");

  bookmarkTitleE.textContent = bookmark.desc;
  bookmarkTitleE.className = "bookmark-title";
  controlsE.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controlsE);
  setBookmarkAttributes("delete", onDelete, controlsE);

  newBookmarkE.id = "bookmark-" + bookmark.time;
  newBookmarkE.className = "bookmark";
  newBookmarkE.setAttribute("timestamp", bookmark.time);

  newBookmarkE.appendChild(bookmarkTitleE);
  newBookmarkE.appendChild(controlsE);
  bookmarks.appendChild(newBookmarkE);
};

const viewBookmarks = (currentBookmarks=[]) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  return;
};

const onPlay = async e => {
  const BookmarkT = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeT = await getActiveTabURL();

  chrome.tabs.sendMessage(activeT.id, {
    type: "PLAY",
    value: BookmarkT,
  });
};

const onDelete = async e => {
  const activeT = await getActiveTabURL();
  const BookmarkT = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkToDelete = document.getElementById(
    "bookmark-" + BookmarkT
  );

  bookmarkToDelete.parentNode.removeChild(bookmarkToDelete);

  chrome.tabs.sendMessage(activeT.id, {
    type: "DELETE",
    value: BookmarkT,
  }, viewBookmarks);
};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
  const controlE = document.createElement("img");

  controlE.src = "assets/" + src + ".png";
  controlE.title = src;
  controlE.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlE);
};

document.addEventListener("DOMContentLoaded", async () => {
  const activeT = await getActiveTabURL();
  const queryP = activeT.url.split("?")[1];
  const urlP = new URLSearchParams(queryP);

  const currentV = urlP.get("v");

  if (activeT.url.includes("youtube.com/watch") && currentV) {
    chrome.storage.sync.get([currentV], (data) => {
      const cVideoBookmarks = data[currentV] ? JSON.parse(data[currentV]) : [];

      viewBookmarks(cVideoBookmarks);
    });
  } else {
    const contain = document.getElementsByClassName("container")[0];

    contain.innerHTML = '<div class="title">This is not a youtube video page.</div>';
  }
});

