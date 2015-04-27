$(document).ready(function () {
    var current_query = $('.b-form-input__box input');

    chrome.extension.sendRequest({type: 'getStatus'}, function (status) {
        if (status === 'initialize') {
            addMenu();
        } else {
            parseNews();
        }

    });

});


function parseNews() {
    $('.b-news-groups__news').each(function (i, content){
        var data = {};
        var $content = $(content);
        var titleElement = $content.find('.b-news-groups__news-title a');
        data.title = titleElement.text();
        data.url = titleElement.attr('href');
        data.text = $content.find('.b-news-groups__news-description ').text();
        data.date = parseDate($content.find('.b-news-groups__news-date-time').text());
        saveNews(data);
    });

    var next_page = $('a.b-pager__next');
    if (next_page.length) {
        chrome.extension.sendRequest({type: 'loadNextPage'});
    } else {
        chrome.extension.sendRequest({type: 'loadNextTask'});
    }
}

function saveNews(news) {
    chrome.extension.sendRequest({type: 'saveNews', data: news});
}

function parseDate(strDate) {
    // date 13:44 19.06.14
    // date 16:16 01.04
    // date 08:13 вчера
    // date 23:58
    var strTime = strDate.slice(0,6);
    var strDay = strDate.slice(6);
    var format = '';

    if (strDay === "") {
        return moment(strDate, "HH:mm").format(format);
    }

    if (strDay === 'вчера') {
        return moment(strDate, "HH:mm").subtract(1, 'days').format(format);
    }

    if (strDay.length === 5) {
        return moment(strDate, "HH:mm DD.MM").format(format);
    }

    if (strDay.length === 8) {
        return moment(strDate, "HH:mm DD.MM.YY").format(format);
    }
}

function addMenu() {
    $('body').prepend('<div id="ext-menu" style="height: 100px; background-color: red;">' +
    'From: <input placeholder="date" name="dateFrom"><input placeholder="monthFrom" name="monthFrom"><input placeholder="yearFrom" name="yearFrom">' +
    'To: <input placeholder="date" name="dateTo"><input placeholder="monthTo" name="monthTo"><input placeholder="yearTo" name="yearTo">' +
    '<button>Run</button>' +
    '</div>');

    $('#ext-menu button').on('click', function () {
        chrome.extension.sendRequest({type: 'startParsing', data: getDates()});
    });
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