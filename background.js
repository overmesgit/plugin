var currentStatus = 'initialize';
var dates = null;
var synonyms = [];
var currentTask = null;
var lastDate = null;
var currentSynonymIndex = -1;
var requests = 0;
getSynonims();

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    var data = request['data'];
    var res = null;
    switch (request['type']) {
        case 'getStatus': res = getStatus(data); break;
        case 'startParsing': res = startParsing(data); break;
        case 'loadNextPage': res = loadNextPage(data); break;
        case 'loadNextTask': res = loadNextTask(data); break;
        case 'saveNews': res = saveNews(data); break;
    }
    sendResponse(res);

});

function startParsing(data) {
    dates = data;
    currentStatus = 'parsing';
    loadNextTask();
}

function loadNextTask() {
    currentSynonymIndex += 1;

    if (currentSynonymIndex >= synonyms.length) {
        currentStatus = 'initialize';
        changeUrl('https://news.yandex.ru/');
    } else {
        var currentSynonym = synonyms[currentSynonymIndex];
        currentTask = _.clone(dates);
        currentTask.synonym = currentSynonym;
        currentTask.text = currentSynonym.name;
        currentTask.page = 0;

        changeUrl(getTaskUrl(currentTask));
    }

}

function loadNextPage(data) {
    if (requests > 20) {
        setTimeout(loadNextPage, 1000)
    } else {
        currentTask.page += 1;
        changeUrl(getTaskUrl(currentTask));
    }
}

function saveNews(news) {
    news['project'] = parseInt(currentTask.synonym.project.split('/').slice(-2, -1));
    requests += 1;
    $.post('http://127.0.0.1/news/import/', JSON.stringify(news), function () {
        requests -= 1;
    });
}

function getStatus(data) {
    return currentStatus;
}

function changeUrl(url) {
    chrome.tabs.getSelected(null, function(tab){
        if (tab) chrome.tabs.update(tab.id, {url: url});
    });
}

function getTaskUrl(task) {
    var template_url = _.template('https://news.yandex.ru/yandsearch?' +
    'rel=tm&rpt=nnews2&within=777&numdoc=30&showdups=1&' +
    'from_day=<%- dateFrom %>&from_month=<%- monthFrom %>&from_year=<%- yearFrom %>&' +
    'p=<%- page %>&text=<%- text %>&' +
    'to_day=<%- dateTo %>&to_month=<%- monthTo %>&to_year=<%- yearTo %>');
    return template_url(task);
}

function getSynonims() {
    var url = 'http://monitor.mediaconsulting.su/api/synonym/';
    $.getJSON(url, {project__parsing_status: 'RUN', 'limit': 0}, function (result) {
        synonyms = result.objects;
    })
}

