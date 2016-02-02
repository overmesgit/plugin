var currentStatus, dates, synonyms, currentTask, currentSynonymIndex, newsList, requests, currentProjectId, currentTab;
var serverAddress = 'http://monitor.mediaconsulting.su';
//var serverAddress = 'http://127.0.0.1:8000';
initialize();

function initialize() {
    currentStatus = 'initialize';
    dates = null;
    synonyms = synonyms && synonyms.length > 0 ? synonyms : [];
    currentTask = null;
    currentSynonymIndex = -1;
    newsList = [];
    requests = 0;
    currentProjectId = null;
}

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
    dates = data['dates'];
    currentProjectId = data['projectId'];
    var apiKey = data['apiKey'];
    currentStatus = 'parsing';
    chrome.tabs.getSelected(function(tab){
        currentTab = tab;
        getSynonims(apiKey, function (result) {
            synonyms = result.objects;
            loadNextTask();
        });
    });


}

function loadNextTask() {
    currentSynonymIndex += 1;

    sendAllNews();
    if (currentSynonymIndex >= synonyms.length) {
        initialize();
        changeUrl('https://news.yandex.ru/');
    } else {
        var currentSynonym = synonyms[currentSynonymIndex];
        currentTask = _.clone(dates);
        currentTask.synonym = currentSynonym;
        currentTask.text = currentSynonym.name;
        currentTask.page = 0;
        currentTask.project = getTaskProject(currentSynonym);
        if (currentProjectId && currentProjectId != currentTask.project) {
            loadNextTask();
        } else {
            changeUrl(getTaskUrl(currentTask));
        }

    }

}

function loadNextPage(data) {

    if (requests > 2) {
        setTimeout(loadNextPage, 1000)
    } else {
        sendAllNews();
        currentTask.page += 1;
        changeUrl(getTaskUrl(currentTask));
    }
}

function sendAllNews() {
    if (newsList.length > 0) {
        var filledList = newsList;
        newsList = [];
        requests += 1;
        var url = serverAddress + '/news/import/';
        //var url = 'http://127.0.0.1/news/import/';
        $.post(url, JSON.stringify(filledList)).always(function () {
            requests -= 1;
        });
    }
}

function saveNews(news) {
    news['project'] = currentTask.project;
    newsList.push(news);
}

function getTaskProject(synonim) {
    return parseInt(synonim.project.split('/').slice(-2, -1));
}

function getStatus(data) {
    return currentStatus;
}

function changeUrl(url) {
    chrome.tabs.update(currentTab.id, {url: url});
}

function getTaskUrl(task) {
    var template_url = _.template('https://news.yandex.ru/yandsearch?' +
    'rel=tm&rpt=nnews2&within=777&numdoc=30&showdups=1&' +
    'from_day=<%- dateFrom %>&from_month=<%- monthFrom %>&from_year=<%- yearFrom %>&' +
    'p=<%- page %>&text=<%= text %>&' +
    'to_day=<%- dateTo %>&to_month=<%- monthTo %>&to_year=<%- yearTo %>');
    return template_url(task);
}

function getSynonims(apiKey, callback) {
    var url = serverAddress + '/api/public-synonym/?api_key=' + apiKey;
    $.getJSON(url, {project__parsing_status: 'RUN', 'limit': 0}, callback)
}

