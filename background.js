chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const qParameters = tab.url.split("?")[1];
    const uParameters = new URLSearchParams(qParameters);

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: uParameters.get("v"),
    });
  }
});
