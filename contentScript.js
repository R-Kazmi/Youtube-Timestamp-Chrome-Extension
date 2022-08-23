(() => {
  let ytbLeftControls, ytPlayer;
  let cVideo = "";
  let cVideoBookmarks = [];

  const fBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([cVideo], (obj) => {
        resolve(obj[cVideo] ? JSON.parse(obj[cVideo]) : []);
      });
    });
  };

  const addNewBookmarkEventHandler = async () => {
    const cTime = ytPlayer.cTime;
    const newBookmark = {
      time: cTime,
      desc: "Bookmark at " + gTime(cTime),
    };

    cVideoBookmarks = await fBookmarks();

    chrome.storage.sync.set({
      [cVideo]: JSON.stringify([...cVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
    });
  };

  const newVideoLoaded = async () => {
    const bookmarkButtonExists = document.getElementsByClassName("bookmark-btn")[0];

    cVideoBookmarks = await fBookmarks();

    if (!bookmarkButtonExists) {
      const bookmarkButton = document.createElement("img");

      bookmarkButton.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkButton.className = "ytp-button " + "bookmark-btn";
      bookmarkButton.title = "Click to bookmark current timestamp";

      ytbLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
      ytPlayer = document.getElementsByClassName('video-stream')[0];

      ytbLeftControls.appendChild(bookmarkButton);
      bookmarkButton.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") {
      cVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      ytPlayer.cTime = value;
    } else if ( type === "DELETE") {
      cVideoBookmarks = cVideoBookmarks.filter((b) => b.time != value);
      chrome.storage.sync.set({ [cVideo]: JSON.stringify(cVideoBookmarks) });

      response(cVideoBookmarks);
    }
  });

  newVideoLoaded();
})();

const gTime = t => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().substr(11, 8);
};
