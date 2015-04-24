var queries = ['тарифы жку', 'миграционная политика'];
var localStorage = window.localStorage;

if (!localStorage['queries']) {
    localStorage['queries'] = queries;
}

$(document).ready(function () {
    var current_query = $('.b-form-input__box input');
    var next_page = $('a.b-pager__next');

    if (localStorage['currentTask']) {
        parseNews();
        if (next_page.length > 0) {
            chrome.extension.sendRequest({url: next_page[0].href});
        } else {
            var task = getNextTask();
            localStorage['currentTask'] = task;
            chrome.extension.sendRequest({url: getTaskUrl(task)});
        }
    } else {
        addMenu();
    }

});


function getTaskUrl(task) {
    var template_url = _.template('https://news.yandex.ru/yandsearch?' +
    'rel=tm&grhow=clutop&rpt=nnews2&ncrnd=2302&within=777&numdoc=30&' +
    'from_day=<%- dateFrom %>&from_month=<%- monthFrom %>&from_year=<%- yearFrom %>&' +
    'p=<%- page %>&text=<%- text %>&' +
    'to_day=<%- dateTo %>&to_month=<%- monthTo %>&to_year=<%- yearTo %>');
    return template_url(task);
}


function addMenu() {
    $('body').prepend('<div id="ext-menu" style="height: 100px; background-color: red;">' +
    'From: <input placeholder="date" name="dateFrom"><input placeholder="monthFrom" name="monthFrom"><input placeholder="yearFrom" name="yearFrom">' +
    'To: <input placeholder="date" name="dateTo"><input placeholder="monthTo" name="monthFrom"><input placeholder="yearFrom" name="yearTo">' +
    '<button>Run</button>' +
    '</div>');

    $('#ext-menu button').on('click', function () {
        var task = getDates();
        var text = localStorage['queries'];
        var textArray = text.split(',');
        task['text'] = textArray.pop();
        task['page'] = 1;

        localStorage['queries'] = textArray.join();

        return task;
    })
}

function getDates() {
    var res = {};
    res['dateFrom'] = $('#ext-menu [name=dateFrom]').val();
    res['monthFrom'] = $('#ext-menu [name=monthFrom]').val();
    res['yearFrom'] = $('#ext-menu [name=yearFrom]').val();

    res['dateTo'] = $('#ext-menu [name=dateTo]').val();
    res['monthTo'] = $('#ext-menu [name=monthTo]').val();
    res['yearTo'] = $('#ext-menu [name=yearTo]').val();

    return res;
}
//$.getJSON('https://api.github.com/users/overmes').done(function (result) {
//    console.log(result);
//});