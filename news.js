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
    var mainNews = null;
    var mainTitle = null;
    $('.search-list .search-item .document').each(function (i, content){
        var data = {};
        var $content = $(content);

        var titleElement = $content.find('.document__title a');
        data.source = titleElement.attr('href');
        data.source_name = $content.find('.document__provider-name').text();

        data.text = $content.find('.document__snippet').text();

        data.title = titleElement.text();
        data.date = $content.find('.document__time').text();
        saveNews(data);
    });

    var next_page = $('.pager__group .button:contains("Следующая")');
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
    $('body').prepend('<div id="ext-menu" style="height: 100px; background-color: red;"><table>' +
    '<tr>' +
        '<td>UserName:</td><td><input id="userName" type="text"></td>' +
        '<td>ApiKey:</td><td><input id="apiKey" type="text"></td>' +
    '</tr>' +
    '<tr>' +
        '<td>From:</td><td><input id="datepickerFrom" style="position: relative; z-index: 100000;"></td>' +
        '<td>To:</td><td><input id="datepickerTo" style="position: relative; z-index: 100000;"></tr>' +
    '<tr>' +
        '<td>Project:</td><td><input type="text" id="projectId" placeholder="project id"/></td>' +
        '<td><button>Старт</button>' +
    '</tr>' +
    '</table></div>');

    $( "#datepickerFrom" ).datepicker({
        inline: true,
        dateFormat: "dd.mm.yy"
    });

    $( "#datepickerTo" ).datepicker({
        inline: true,
        dateFormat: "dd.mm.yy"
    });

    $('#ext-menu button').on('click', function () {
        var parsedValue = parseInt($('#projectId').val());
        var projectId = isNaN(parsedValue) ? null: parsedValue;
        var apiKey = $('#apiKey').val();
        var userName = $('#userName').val();
        var dateFrom = $('#datepickerFrom').val();
        var dateTo = $('#datepickerTo').val();
        if (apiKey.length && userName.length && dateFrom.length && dateTo.length) {
            chrome.extension.sendRequest({type: 'startParsing',
                data: {dates: getDates(), projectId: projectId, apiKey: apiKey, userName: userName}
            });
        }
    });
}

function getDates() {
    var res = {};
    var strDateFromArray = $('#datepickerFrom').val().split('.');
    res['dateFrom'] = parseInt(strDateFromArray[0]);
    res['monthFrom'] = parseInt(strDateFromArray[1]);
    res['yearFrom'] = parseInt(strDateFromArray[2]);

    var strDateToArray = $('#datepickerTo').val().split('.');
    res['dateTo'] = parseInt(strDateToArray[0]);
    res['monthTo'] = parseInt(strDateToArray[1]);
    res['yearTo'] = parseInt(strDateToArray[2]);

    return res;
}