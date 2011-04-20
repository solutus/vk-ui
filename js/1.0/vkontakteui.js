/*
 * VKontakte UI Framework, version 1.0
 * Last update: 20.04.2011
 *
 * Author: Konstantin Babushkin
 */

// Создаем новый объект VK, если таковой не имеется
// Впрочем, если подключен xd_connection для приложений, он уже присутствует
if (typeof(VK) == 'undefined') VK = {};

// Объект для системных функций и переменных
VK._ui = {
    require: function (url, type) {
        if (!type) {
            format = url.split('.')[url.split('.').length - 1];
            type = format == 'js' ? 'script': 'link';
        };
        if (typeof url == 'object' || typeof url == 'array') {
            for (var key in url) {
                VK._ui.require(url[key], type ? type: false);
            };
        } else {
            req = document.createElement(type);
            req[type == 'script' ? 'type': 'rel'] = type == 'script' ? 'text/javascript': 'stylesheet';
            req[type == 'script' ? 'src': 'href'] = url;
            document.getElementsByTagName('head')[0].appendChild(req);
        };
    },
    box: {},
    size: {},
    drop: {},
    check: {},
    radio: {}
};

// Запрашиваем скрипты и стили
(function () {
    try {
        VK._ui.require(['http://vk.com/js/common.js', 'http://vk.com/js/lib/ui_controls.js'], 'script');
        VK._ui.require(['http://vk.com/css/rustyle.css', 'http://vk.com/css/al/common.css', 'http://vk.com/css/ui_controls.css'], 'link');
    } finally {
        /*
         * Пример использования: VK.box('box', 'My box', 500, ['box.php', {foo: 'bar'}], [{style: 'gray', label: 'Close', onClick: function(){VK.box('box', false);}}], {callback: onBoxCreate, onHide: function(){alert('Good luck!');}})
         * Манипуляции показать/скрыть бокс: VK.box('box', true/false);
         *
         * Name: первый аргумент, уникальное имя
         * Title: заголовок, конечно
         * Width: ширина бокса
         * Content: строка/массив с аргументами для загрузки по url
         * Buttons: массив, включающий объекты с параметрами
         * * Style: строка, gray/blue
         * * Label: строка
         * * onClick: функция
         * Options: объект с прочими параметрами
         * Autoposition: использовать ли автопозиционирование для приложений методом getScroll
         */
        VK.box = function (name, title, width, content, buttons, options, autoposition) {
            if (name && typeof title == 'boolean' && VK._ui.box[name])(title === true ? VK._ui.box[name].show() : VK._ui.box[name].hide());
            else {
                VK._ui.box[name] = new MessageBox({
                    title: title,
                    width: width
                }).removeButtons();
                for (i = 0; i < buttons.length; i++) {
                    VK._ui.box[name].addButton({
                        style: 'button_' + buttons[i]['style'].toString(),
                        label: buttons[i]['label'],
                        onClick: buttons[i]['onClick']
                    });
                };
                if (typeof options == 'object') {
                    for (var key in options) {
                        VK._ui['boxOptions'] = {};
                        VK._ui['boxOptions'][key] = options[key];
                        VK._ui.box[name].setOptions(VK._ui['boxOptions']);
                    };
                };
                if (typeof content == 'object' || typeof content == 'array') {
                    VK._ui['box']['c_' + name] = content[0] + (content[1] ? '?': '');
                    if (content[1]) for (var key in content[1]) VK._ui['box']['c_' + name] += key + '=' + content[1][key] + '&';
                    VK._ui.box[name].loadContent(VK._ui['box']['c_' + name].slice(0, -1), 0, true);
                } else if (typeof content == 'string') {
                    VK._ui.box[name].content(content);
                };
                VK._ui.box[name].show();
                if (typeof options.callback == 'function') {
                    // Охрененный способ создания каллбэка
                    VK._ui.box['i_' + name] = setInterval(function () {
                        if (geByClass('message_box')[0]) {
                            clearInterval(VK._ui.box['i_' + name]);
                            options.callback();
                        };
                    },
                    100);
                };
                if (autoposition) {
                    VK.addCallback('onScrollTop', function (scroll) {
                        geByClass('message_box')[0].style.top = (scroll > 150 ? scroll: 150) + 'px';
                    });
                    VK.callMethod('scrollTop');
                };
            }
        };
        /*
         * Пример использования: VK.size('autosize', 0, {minHeight: 200});
         *
         * Name: уникальный идентификатор
         * Width: ширина поля
         * Options: объект с опциями
         */
        VK.size = function (name, width, options) {
            if (width) ge(name).style.width = width;
            VK._ui.size[name] = new Autosize(ge(name), options);
        };
        /*
         * Пример использования: VK.drop('dropdown', 200, [[1, 'Glock 18'],[2, 'Arctic Warfare Magnum', 'AWP. One shot – one kill.'],[3, 'HE Grenade', 'B-8-4. Maximal damage - 72HP.']]);
         *
         * Name: уникальный идентификатор
         * Data: массив с данными, формат: [[value, title[, descr]]]
         * Options: объект с опциями
         */
        VK.drop = function (name, width, data, options) {
            // Dropdown можно использовать для создания autocomplete списка, просто пропишите в опциях autocomplete: true
            // В таком случае поиск будет происходить по данным, указанных в data, то есть без лишних запросов
            if (!options) options = {};
            options.width = width;
            VK._ui.drop[name] = new Dropdown(ge(name), data, options);
        };
        /*
         * Пример использования: VK.auto('dropdown', 200, 'hints.php?type=json', {introText: 'Start typing', multiselect: true, defaultItems: [[1, 'Glock 18'], [2, 'Arctic Warfare Magnum']]});
         *
         * Name: уникальный идентификатор
         * Data: Ссылка для получения элементов
         * * Ответ должен быть в формате json, формат:
         * * [[value, title[, descr][, photo][, nonsense], [, nonsense]]]
         * Options: объект с параметрами
         * * cacheLength (int), defaultItems (array), introText (string), maxItems (int), maxItemsShown (int), multiselect (boolean), noResult (string), placeholder (string), placeholderColor (string, hex color), placeholderColored (boolean), showMax (int)
         */
        VK.auto = function (name, width, data, options) {
            if (!options) options = {};
            extend(options, {
                autocomplete: true,
                width: width
            });
            VK._ui.drop[name] = new Autocomplete(ge(name), data, options);
        };
        /*
         * Пример использования: VK.check('checkbox', 'Servers', 200);
         *
         * Name: уникальный идентификатор
         * Label: метка
         * Width: ширина
         * Checked: логическая конструкция: выбранный чек-бокс
         * Options: объект с опциями (checkedValue, notCheckedValue, onChange (value) и т. д.)
         * Display: возвращать видимым (true) или скрытым (false)
         */
        VK.check = function (name, label, width, checked, options, display) {
            if ((VK._ui.check[name] || typeof name == 'object' || typeof name == 'array') && typeof label == 'boolean') {
                if (typeof name == 'object' || typeof name == 'array') {
                    for (a = 0; a < name.length; a++) {
                        VK.check(name[a], label);
                    };
                } else {
                    for (i = 0; i < geByClass('checkbox_container').length; i++) {
                        VK._ui.check['l_' + name] = geByClass('checkbox_container')[i];
                        if (VK._ui.check['l_' + name].innerHTML.match(/id=('|"|)(.[^"']*)('|"|\s)/)[2] === name) {
                            VK._ui.check['l_' + name].style.display = label == true ? 'block': 'none';
                        };
                    };
                };
            } else {
                if (checked) {
                    ge(name).value = 1;
                };
                if (!options) options = {};
                options.label = label;
                options.width = width;
                VK._ui.check[name] = new Checkbox(ge(name), options);
                if (typeof display == 'boolean') {
                    VK.check(name, display);
                };
            };
        };
        /*
         * Пример использования: VK.radio('radiobutton', 'Flash', 200, 1);
         * Манипуляции над отображаемым/скрытым переключателем: VK.radio(['id1', 'id2', 'id3'], true/false);
         * Получение выбранного значения: VK.radio('radio');
         * * Вернет массив: [value, id]
         * Выбрать переключатель по его идентификатору: VK.radio('radiobutton', 'select');
         *
         * Name: уникальный идентификатор
         * Label: метка
         * Width: ширина
         * Checked: логическая конструкция: выбранный переключатель
         * Options: объект с опциями (select (value, name), deselect (value, name) и т. д.)
         * Display: возвращать видимым (true) или скрытым (false)
         */
        VK.radio = function (name, label, width, checked, options, display) {
            if (name && typeof label === 'undefined') {
                each(geByClass('radiobtn_container'), function (i, v) {
                    if (geByClass('radiobtn_on', v).length) {
                        VK._ui.radio['ch_' + name] = [v.getElementsByTagName('input')[0].value, v.getElementsByTagName('input')[0].id];
                        return false;
                    };
                });
                return VK._ui.radio['ch_' + name];
            } else if ((VK._ui.radio[name] || typeof name == 'object' || typeof name == 'array') && typeof label == 'boolean') {
                if (typeof name == 'object' || typeof name == 'array') {
                    for (a = 0; a < name.length; a++) {
                        VK.radio(name[a], label);
                    };
                } else {
                    for (i = 0; i < geByClass('radiobtn_container').length; i++) {
                        VK._ui.radio['l_' + name] = geByClass('radiobtn_container')[i];
                        if (VK._ui.radio['l_' + name].innerHTML.match(/id=('|"|)(.[^"']*)('|"|\s)/)[2] === name) {
                            VK._ui.radio['l_' + name].style.display = label == true ? 'block': 'none';
                        };
                    };
                };
            } else if (label === 'select' && ge(name).name && ge(name).value) {
                Radiobutton.select(ge(name).name, ge(name).value);
            } else {
                if (!options) options = {};
                options.label = label;
                options.width = width;
                VK._ui.radio[name] = new Radiobutton(ge(name), options);
                if (checked && ge(name).name && ge(name).value) {
                    Radiobutton.select(ge(name).name, ge(name).value);
                };
                if (typeof display == 'boolean') {
                    VK.radio(name, display);
                };
            };
        };
    };
})();