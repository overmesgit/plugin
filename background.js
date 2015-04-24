

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    console.log('111');
    chrome.tabs.getSelected(null, function(tab){
        console.log('222');
        if (tab) chrome.tabs.update(tab.id, {url: request.url});
    });
});

