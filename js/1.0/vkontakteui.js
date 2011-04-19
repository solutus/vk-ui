/*
 * VKontakte UI Framework, version 1.0
 * Last update: 11.04.2011
 *
 * Author: Konstantin Babushkin
 */

// Create a new object with name VK
// However, if the xd_connection.js is connected, then it should already be.
if (typeof(VK) == 'undefined') VK = {};

// Array for system variables
VK._ui = {
	require: function(type, url){
		if(typeof url == 'object' || typeof url == 'array') {
			for(var key in url){
				VK._ui.require(type, url[key]);
			};
		} else {
			req = document.createElement(type);
			req[type == 'script' ? 'type' : 'rel'] = type == 'script' ? 'text/javascript' : 'stylesheet';
			req[type == 'script' ? 'src' : 'href'] = url;
			document.getElementsByTagName('head')[0].insertBefore(req, document.getElementsByTagName('head')[0].firstChild);
		};
	},
	box: {},
	size: {},
	drop: {},
	check: {},
	radio: {},
	date: {}
};

// Require scripts and styles
(function(){
	try {
		VK._ui.require('script', ['http://vk.com/js/common.js', 'http://vk.com/js/lib/ui_controls.js', 'http://vk.com/js/al/datepicker.js']);
		VK._ui.require('link', ['http://vk.com/css/al/datepicker.css', 'http://vk.com/css/ui_controls.css', 'http://vk.com/css/al/common.css', 'http://vk.com/css/rustyle.css']);
		document.getElementsByTagName('body')[0].insertBefore('<div id="box_layer_bg" class="fixed"></div><div id="box_layer_wrap" class="scroll_fix_wrap fixed"><div id="box_layer"></div></div>', document.getElementsByTagName('body')[0].firstChild);
	} finally {
		return false;
	};
})();

/*
 * Example for usage: VK.box('box', 'My box', 500, ['box.php', {foo: 'bar'}], [{style: 'gray', label: 'Close', onClick: function(){VK.box('box', false);}}], {callback: onBoxCreate, onHide: function(){alert('Good luck!');}})
 * Manipulation with show/hide box: VK.box('box', true/false);
 *
 * Name: first argument, unique identificator for messagebox
 * Title: name, of course
 * Width: width of messagebox
 * Content: string/array with arguments for load from url
 * Buttons: array, including object with the parameters
 * * Style: string, gray/blue
 * * Label: string
 * * onClick: function
 * Options: sixth argument, object
 */
 
VK.box = function (name, title, width, content, buttons, options, autoposition) {
	if (name && typeof title == 'boolean' && VK._ui.box[name]) (title === true ? VK._ui.box[name].show() : VK._ui.box[name].hide()); else {
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
		if(typeof options == 'object'){
			for (var key in options) {
				VK._ui['boxOptions'] = {};
				VK._ui['boxOptions'][key] = options[key];
				VK._ui.box[name].setOptions(VK._ui['boxOptions']);
			};
		};
		if (typeof content == 'object' || typeof content == 'array') {
			VK._ui['box']['c_' + name] = content[0] + (content[1] ? '?' : '');
			if(content[1]){
				for (var key in content[1]) {
					VK._ui['box']['c_' + name] += key + '=' + content[1][key] + '&';
				};
			};
			VK._ui.box[name].loadContent(VK._ui['box']['c_' + name].slice(0, -1), 0, true);
		} else if (typeof content == 'string') {
			VK._ui.box[name].content(content);
		};
		VK._ui.box[name].show();
		if(typeof options.callback == 'function'){
			// This way we create the callback!
			VK._ui.box['i_' + name] = setInterval(function(){
				if(geByClass('message_box')[0]) {
					clearInterval(VK._ui.box['i_' + name]);
					options.callback();
				};
			}, 200);
		};
		if(autoposition) {
		VK.addCallback('onScrollTop', function(scroll){
			geByClass('message_box')[0].style.top = (scroll > 150 ? scroll : 150) + 'px';
		});
		VK.callMethod('scrollTop');
		};
	}
};
/*
 * Example for usage: VK.size('autosize', 0, {minHeight: 200});
 *
 * Name: unique identificator for autosize
 * Width: width of textarea
 * Options: object with options
 */
VK.size = function(name, width, options){
	if(width) ge(name).style.width = width;
	VK._ui.size[name] = new Autosize(ge(name), options);
};
/*
 * Example for usage: VK.drop('dropdown', 200, [[1, 'Glock 18'],[2, 'Arctic Warfare Magnum', 'AWP. One shot – one kill.'],[3, 'HE Grenade', 'B-8-4. Maximal damage - 72HP.']]);
 *
 * Name: unique identificator for dropdown
 * Data: array with selectors, format: [[value, title[, descr]]]
 * Options: object with options
 */
VK.drop = function(name, width, data, options){
	// You can use this method to create autocomplete, easy indicate in options autocomplete: true
	// Search for items will be done on specified items (without queries)
	if(!options) options = {};
	options.width = width;
	VK._ui.drop[name] = new Dropdown(ge(name),
		data,
		options
	);
};
/*
 * Example for usage: VK.auto('dropdown', 200, 'hints.php?type=json', {introText: 'Start typing', multiselect: true, defaultItems: [[1, 'Glock 18'], [2, 'Arctic Warfare Magnum']]});
 *
 * Name: unique identificator for dropdown
 * Data: Link to get an items
 * * Your response must been in json-format:
 * * [[value, title[, descr][, photo][, nonsense], [, nonsense]]]
 * Options: object with options
 * * Parameters: cacheLength (int), defaultItems (array with default items to check), introText (string), maxItems (int), maxItemsShown (int), multiselect (boolean), noResult (string), placeholder (string), placeholderColor (string, hex color), placeholderColored (boolean), showMax (int)
 */
VK.auto = function(name, width, data, options){
	if(!options) options = {};
	extend(options, {
		autocomplete: true,
		width: width
	});
	VK._ui.drop[name] = new Autocomplete(ge(name),
		data,
		options
	);
};
/*
 * Example for usage: VK.check('checkbox', 'Servers', 200);
 *
 * Name: unique identificator for checkbox
 * Label: title of checkbox
 * Width: width of checkbox
 * Checked: boolean indicator for checked checkbox
 * Options: object with options (checkedValue, notCheckedValue, onChange (value) etc.)
 * Display: return visible (true) or hidden (false)
 */
VK.check = function(name, label, width, checked, options, display){
	if((VK._ui.check[name] || typeof name == 'object' || typeof name == 'array') && typeof label == 'boolean'){
		if(typeof name == 'object' || typeof name == 'array') {
			for(a = 0; a < name.length; a++) {
				VK.check(name[a], label);
			};
		} else {
			for(i = 0; i < geByClass('checkbox_container').length; i++) {
				VK._ui.check['l_' + name] = geByClass('checkbox_container')[i];
				if(VK._ui.check['l_' + name].innerHTML.match(/id=('|"|)(.[^"']*)('|"|\s)/)[2] === name){
					VK._ui.check['l_' + name].style.display = label == true ? 'block' : 'none';
				};
			};
		};
	} else {
		if(checked) {
			ge(name).value = 1;
		};
		if(!options) options = {};
		options.label = label;
		options.width = width;
		VK._ui.check[name] = new Checkbox(ge(name),
			options
		);
		if(typeof display == 'boolean'){
			VK.check(name, display);
		};
	};
};
/*
 * Example for usage: VK.radio('radiobutton', 'Flash', 200, 1);
 * Manipulation with show/hide radiobutton: VK.radio(['id1', 'id2', 'id3'], true/false);
 * Get a checked radiobutton values: VK.radio('radio');
 * * Returns array: [value, id]
 * Select some radiobutton by ID: VK.radio('radiobutton', 'select');
 *
 * Name: unique identificator for radiobutton
 * Label: title of radiobutton
 * Width: width of radiobutton
 * Checked: boolean indicator for active radiobutton
 * Options: object with options (select (value, name), deselect (value, name) etc.)
 * Display: return visible (true) or hidden (false)
 */
VK.radio = function(name, label, width, checked, options, display){
	if(name && typeof label === 'undefined') {
		each(geByClass('radiobtn_container'), function(i, v){
			if(geByClass('radiobtn_on', v).length) {
				VK._ui.radio['ch_' + name] = [v.getElementsByTagName('input')[0].value, v.getElementsByTagName('input')[0].id];
				return false;
			};
		});
		return VK._ui.radio['ch_' + name];
	} else if((VK._ui.radio[name] || typeof name == 'object' || typeof name == 'array') && typeof label == 'boolean') {
		if(typeof name == 'object' || typeof name == 'array') {
			for(a = 0; a < name.length; a++) {
				VK.radio(name[a], label);
			};
		} else {
			for(i = 0; i < geByClass('radiobtn_container').length; i++) {
				VK._ui.radio['l_' + name] = geByClass('radiobtn_container')[i];
				if(VK._ui.radio['l_' + name].innerHTML.match(/id=('|"|)(.[^"']*)('|"|\s)/)[2] === name){
					VK._ui.radio['l_' + name].style.display = label == true ? 'block' : 'none';
				};
			};
		};
	} else if(label === 'select' && ge(name).name && ge(name).value) {
		Radiobutton.select(ge(name).name, ge(name).value);
	} else {
		if(!options) options = {};
		options.label = label;
		options.width = width;
		VK._ui.radio[name] = new Radiobutton(ge(name),
			options
		);
		if(checked && ge(name).name && ge(name).value) {
			Radiobutton.select(ge(name).name, ge(name).value);
		};
		if(typeof display == 'boolean'){
			VK.radio(name, display);
		};
	};
};
/*
 * Example for usage: VK.date('datepicker', 200);
 *
 * Name: unique identificator for datepicker
 * Width: width of datepicker
 * Time: default value (timestamp)
 * Options: object with options
 */
VK.date = function(name, width, time, options){
	ge(name).value = time ? time : Math.round(new Date().getTime() / 1000);
	if(!options) options = {};
	options.width = width;
	VK._ui.date[name] = new Datepicker(name,
		options
	);
};