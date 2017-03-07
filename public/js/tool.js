/**
* ����Jquery�Ĳ����
* ��ʽλ��style.css
* @author: Ymj
* @creatTime: 2012-11-13
* @lastModior:li.hq
* @lastModiTime:2012-11-22
*/
(function (window, $) {
    var document = window.document,
		$ = window.jQuery,
		instance = [],
		loadingDely = null,
		zIndex = 99999;					//���ڵõ���ǰzIndex�����ֵ
    $.extend({
        /**
		 * ����Key��ȡURL�еĲ���ֵ����������KEYʱ����NULL����������VALUEʱ���ؿ��ַ���
		 * @author Ymj Created at 2012-12-1
		 */
        getParmByName: function (key) {
            var url = window.location.href,
				index = url.indexOf("?"),
				keyArr;
            if (index >= 0) {
                keyArr = url.substr(index + 1).split("#")[0].split("&");
                for (var i = 0; i < keyArr.length; i++) {
                    if (keyArr[i].split("=")[0] == key)
                        return keyArr[i].split("=")[1] || "";
                }
            }
            return null;
        },

        /***
		 * ����#�������
		 */
        getLocalParm: function (key) {
            var url = window.location.href,
				index = url.indexOf("#"),
				keyArr;
            if (index >= 0) {
                keyArr = url.substr(index + 1).split("&");
                for (var i = 0; i < keyArr.length; i++) {
                    if (keyArr[i].split("=")[0] == key)
                        return keyArr[i].split("=")[1] || "";
                }
            }
            return null;
        },

        /***
		 * ������޸�#�������
		 * �����б���
		 */
        setLocalParm: function (key, val) {
            if (typeof key == 'object' && key instanceof Object) {
                for (var name in key) {
                    arguments.callee(name, key[name]);
                }
                return;
            }
            var url = window.location.href,
				index = url.indexOf("#"),
				key = key.toLowerCase(),
				keyArr,
				reg = new RegExp('(' + key + '=[^&]*)');
            if (index >= 0) {
                keyArr = url.substr(index + 1);
                if (keyArr.match(reg)) {
                    //�Ѵ���
                    window.location.href = url.replace(reg, key + '=' + val);
                }
                else {
                    if (keyArr == "") {
                        window.location.href = url + key + '=' + val;
                    }
                    else {
                        window.location.href = url + "&" + key + '=' + val;
                    }
                }
            }
            else {
                window.location.href = url + '#' + key + '=' + val;
            }
        },


        history: (function () {
            var locationWrapper = {
                put: function (hash, win, encode) {
                    (win || window).location.hash = encode ? this.encoder(hash) : hash;
                },
                get: function (win) {
                    var hash = ((win || window).location.hash).replace(/^#/, '');
                    try {
                        return $.browser.mozilla ? hash : decodeURIComponent(hash);
                    }
                    catch (error) {
                        return hash;
                    }
                },
                query: function (name, _hash) {
                    if (!name) return '';
                    var hash = arguments.length == 2 ? _hash : this.get(),
                        pairs = hash.split('&'),
                        i = 0,
                        len = pairs.length;
                    if (!len) return '';
                    for (; i < len && !new RegExp("^" + name + "=([a-zA-Z0-9_\\-]*)$").test(pairs[i]) ; i++);
                    if (i == len) return '';
                    return RegExp.$1;
                },
                setParam: function () {
                    var _segment = this.get(),
                        hash = '',
                        args = arguments;
                    //setParam({foo: '123'})
                    //setParam({foo: '123'}, true} 
                    if ('object' === typeof args[0]) {
                        if (args[1]) {
                            //ֱ���滻hash��
                            for (name in args[0]) {
                                hash += name + '=' + args[0][name] + '&';
                            }
                            hash = hash.slice(0, -1);
                        } else {
                            //ƴ��hash��
                            for (name in args[0]) {
                                var regex = new RegExp("(.*&?" + name + "=)([^&]*)(&.*)?", "g");
                                if (regex.test(_segment)) {
                                    _segment = _segment.replace(regex, "$1" + args[0][name] + "$3");
                                } else {
                                    _segment = !!_segment ? _segment + '&' + name + '=' + args[0][name] : name + '=' + args[0][name];
                                }
                            }
                            hash = _segment;
                        }
                        this.put(hash);
                    } else if ('string' === typeof args[0]) {
                        //setParam(foo, '123', true) || setParam(foo, '123')
                        if (args[2]) {
                            hash = args[0] + '=' + args[1];
                        } else {
                            var regex = new RegExp("(.*&?" + args[0] + "=)([^&]*)(&.*)?", "g");
                            if (regex.test(_segment)) {
                                hash = _segment.replace(regex, "$1" + args[1] + "$3");
                            } else {
                                hash = !!_segment ? _segment + '&' + args[0] + '=' + args[1] : args[0] + '=' + args[1];
                            }
                        }
                        this.put(hash);
                    }
                },
                encoder: encodeURIComponent
            };

            var iframeWrapper = {
                id: "__jQuery_history",
                init: function () {
                    var html = '<iframe id="' + this.id + '" style="display:none" src="javascript:false;" />';
                    $("body").prepend(html);
                    return this;
                },
                _document: function () {
                    return $("#" + this.id)[0].contentWindow.document;
                },
                put: function (hash) {
                    var doc = this._document();
                    doc.open();
                    doc.close();
                    locationWrapper.put(hash, doc);
                },
                get: function () {
                    return locationWrapper.get(this._document());
                }
            };

            function initObjects(options) {
                options = $.extend({
                    unescape: false
                }, options || {});

                locationWrapper.encoder = encoder(options.unescape);

                function encoder(unescape_) {
                    if (unescape_ === true) {
                        return function (hash) { return hash; };
                    }
                    if (typeof unescape_ == "string" &&
                       (unescape_ = partialDecoder(unescape_.split("")))
                       || typeof unescape_ == "function") {
                        return function (hash) { return unescape_(encodeURIComponent(hash)); };
                    }
                    return encodeURIComponent;
                }

                function partialDecoder(chars) {
                    var re = new RegExp($.map(chars, encodeURIComponent).join("|"), "ig");
                    return function (enc) { return enc.replace(re, decodeURIComponent); };
                }
            }

            var implementations = {};

            implementations.base = {
                callback: undefined,
                listenOn: {},
                type: undefined,
                query: function (name) {
                    return locationWrapper.query(name);
                },
                setParam: function (argv0, argv1, argv2) {
                    locationWrapper.setParam.call(locationWrapper, argv0, argv1, argv2);
                },
                getParam: function (name) {
                    var ret = [],
                        ids = name.split(' '),
                        i = 0,
                        len = ids.length;
                    for (; i < len; i++) {
                        ret.push(locationWrapper.query(ids[i]));
                    }
                    return ret;
                },
                isChanged: function (idStr, preHash) {
                    var ids = idStr.split(' '),
                        i = 0,
                        len = ids.length;
                    for (; i < len && locationWrapper.query(ids[i]) == locationWrapper.query(ids[i], preHash) ; i++);
                    return i < len;
                },
                fire: function (idStr, preHash) {
                    if (self.isChanged(idStr, preHash)) {
                        self.listenOn[idStr].apply(self, self.getParam(idStr));
                    }
                },

                check: function () { },
                load: function (hash) { },
                init: function (callback, options) {
                    initObjects(options);
                    self.callback = callback;
                    self._options = options;
                    self._init();
                },
                listen: function (idStr, fn) {
                    if ('function' === typeof arguments[0]) {
                        //listen on all ids
                        self.listenOn['*'] = fn;
                    } else {
                        self.listenOn[idStr] = fn;
                    }
                    self._listen();
                    return self;
                },

                _init: function () { },
                _listen: function () { },
                _options: {}
            };

            implementations.timer = {
                _appState: undefined,
                _appInterval: null,
                _init: function () {
                    var current_hash = locationWrapper.get();
                    self._appState = current_hash;
                    self.callback(current_hash);
                    setInterval(self.check, 100);
                },
                check: function () {
                    var current_hash = locationWrapper.get();
                    if (current_hash != self._appState) {
                        self._appState = current_hash;
                        self.callback(current_hash);
                    }
                },
                load: function (hash) {
                    if (hash != self._appState) {
                        locationWrapper.put(hash);
                        self._appState = hash;
                        self.callback(hash);
                    }
                },
                _listen: function () {
                    var current_hash = locationWrapper.get();
                    self._appState = current_hash;
                    clearInterval(self._appInterval);
                    $(document).off('ready').on('ready', function () {
                        for (var name in self.listenOn) {
                            self.listenOn[name].apply(self, self.getParam(name));
                        }
                    });
                    self._appInterval = setInterval(function () {
                        current_hash = locationWrapper.get();
                        if (current_hash != self._appState) {
                            for (var name in self.listenOn) {
                                self.fire(name, self._appState);
                            }
                            self._appState = current_hash;
                        }
                    }, 100);
                }
            };

            implementations.iframeTimer = {
                _appState: undefined,
                _appInterval: null,
                _init: function () {
                    var current_hash = locationWrapper.get();
                    self._appState = current_hash;
                    iframeWrapper.init().put(current_hash);
                    self.callback(current_hash);
                    setInterval(self.check, 100);
                },
                check: function () {
                    var iframe_hash = iframeWrapper.get(),
                        location_hash = locationWrapper.get();

                    if (location_hash != iframe_hash) {
                        if (location_hash == self._appState) {    // user used Back or Forward button
                            self._appState = iframe_hash;
                            locationWrapper.put(iframe_hash);
                            self.callback(iframe_hash);
                        } else {                              // user loaded new bookmark
                            self._appState = location_hash;
                            iframeWrapper.put(location_hash);
                            self.callback(location_hash);
                        }
                    }
                },
                load: function (hash) {
                    if (hash != self._appState) {
                        locationWrapper.put(hash);
                        iframeWrapper.put(hash);
                        self._appState = hash;
                        self.callback(hash);
                    }
                },
                _listen: function () {
                    var current_hash = locationWrapper.get();
                    self._appState = current_hash;
                    iframeWrapper.init().put(current_hash);
                    $(document).off('ready').on('ready', function () {
                        for (var name in self.listenOn) {
                            self.listenOn[name].apply(self, self.getParam(name));
                        }
                    });
                    clearInterval(self._appInterval);
                    self._appInterval = setInterval(function () {
                        var iframe_hash = iframeWrapper.get(),
                            location_hash = locationWrapper.get();

                        if (location_hash != iframe_hash) {
                            if (location_hash == self._appState) {    // user used Back or Forward button
                                for (var name in self.listenOn) {
                                    self.fire(name, self._appState);
                                }
                                self._appState = iframe_hash;
                                locationWrapper.put(iframe_hash);
                            } else {                              // user loaded new bookmark
                                for (var name in self.listenOn) {
                                    self.fire(name, self._appState);
                                }
                                self._appState = location_hash;
                                iframeWrapper.put(location_hash);
                            }
                        }
                    }, 100);
                }
            };

            implementations.hashchangeEvent = {
                _appState: undefined,
                _init: function () {
                    self.callback(locationWrapper.get());
                    $(window).bind('hashchange', self.check);
                },
                check: function () {
                    self.callback(locationWrapper.get());
                },
                load: function (hash) {
                    locationWrapper.put(hash);
                },
                _listen: function () {
                    var current_hash = locationWrapper.get();
                    self._appState = current_hash;
                    $(document).ready(function () {
                        for (var name in self.listenOn) {
                            self.listenOn[name].apply(self, self.getParam(name));
                        }
                    });
                    $(window).off('hashchange')	// remove the last event
                    .on('hashchange', function () {
                        for (var name in self.listenOn) {
                            self.fire(name, self._appState);
                        }
                        self._appState = locationWrapper.get();
                    });
                }
            };

            var self = $.extend({}, implementations.base);

            if ($.browser.msie && ($.browser.version < 8 || document.documentMode < 8)) {
                self.type = 'iframeTimer';
            } else if ("onhashchange" in window) {
                self.type = 'hashchangeEvent';
            } else {
                self.type = 'timer';
            }

            self.hash = locationWrapper;

            $.extend(self, implementations[self.type]);

            return self;
        })(),


        /**
		 * ����ͷ��
		 * @param {string} klass Ԥ��ֵ��'', 'attach-to-content'
		 */
        goToTop: function (klass) {
            if ($('.go-to-top').length) {
                $('body,html').animate({ scrollTop: 0 }, 300, 'swing');
                return;
            }
            var $goToTop = $("body").append('<div class="go-to-top"><a href="javascript:" title="���ض���">���ض���</a></div>')
							.find('.go-to-top');
            $.isType(klass, 'string') && $goToTop.addClass(klass);
            $(window).scroll(function () {
                if ($(document).scrollTop() > 300) {
                    $goToTop.fadeIn();
                }
                else {
                    $goToTop.fadeOut();
                }
            });
            $goToTop.children('a').click(function () {
                $('body,html').animate({ scrollTop: 0 }, 300, 'swing');
            });
        },

        /**
		 * ��ʽ�����ʱ�䣨����PHP date������
		 * @param format
		 * 		  (Ĭ��ֵΪ"Y-m-d H:i:s")
		 * 		  Y - 4 λ����������ʾ����� ���磺1999 �� 2003
		 * 		  y - 2 λ���ֱ�ʾ����� ���磺99 �� 03 
		 * 		  m - ���ֱ�ʾ���·ݣ���ǰ���� 01 �� 12 
		 * 		  n - ���ֱ�ʾ���·ݣ�û��ǰ���� 1 �� 12 
		 * 		  d - �·��еĵڼ��죬��ǰ����� 2 λ���� 01 �� 31 
		 * 		  j - �·��еĵڼ��죬û��ǰ���� 1 �� 31 
		 * 		  w - �����еĵڼ��죬���ֱ�ʾ 0����ʾ�����죩�� 6����ʾ�������� 
		 * 		  l - ����L����Сд��ĸ�� ���ڼ����������ı���ʽ ����һ �� ������ 
		 * 		  g - Сʱ��12 Сʱ��ʽ��û��ǰ���� 1 �� 12 
		 *		  G - Сʱ��24 Сʱ��ʽ��û��ǰ���� 0 �� 23 
		 * 		  h - Сʱ��12 Сʱ��ʽ����ǰ���� 01 �� 12 
		 * 		  H - Сʱ��24 Сʱ��ʽ����ǰ���� 00 �� 23 
		 * 		  i - ��ǰ����ķ����� 00 �� 59
		 * 		  s - ��������ǰ���� 00 �� 59
		 * 		 ��������ʽ�����䣩
		 * @param microsecond
		 * 		  ΢���������û�и�����ʹ�ñ��ص�ǰʱ��
		 */
        dateFormat: function (format, microsecond) {
            var options = {
                format: "Y-m-d H:i:s",
                microsecond: new Date().getTime()
            }, date, mapTable, outPutArr = [];
            //ӳ���
            mapTable = {
                'Y': function (date) { return date.getFullYear(); },
                'y': function (date) { return (date.getFullYear() + "").substr(2); },
                'm': function (date) { return date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1; },
                'n': function (date) { return date.getMonth() + 1; },
                'd': function (date) { return date.getDate() < 10 ? "0" + date.getDate() : date.getDate(); },
                'j': function (date) { return date.getDate(); },
                'w': function (date) { return date.getDay(); },
                'l': function (date) { return ['������', '����һ', '���ڶ�', '������', '������', '������', '������'][date.getDay()]; },
                'g': function (date) { return date.getHours() > 12 ? date.getHours() - 12 : date.getHours(); },
                'G': function (date) { return date.getHours(); },
                'h': function (date) { var hour; return (hour = date.getHours() > 12 ? date.getHours() - 12 : date.getHours()) < 10 ? "0" + hour : hour; },
                'H': function (date) { return date.getHours() < 10 ? "0" + date.getHours() : date.getHours(); },
                'i': function (date) { return date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(); },
                's': function (date) { return date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds(); }
            };
            if (arguments.length == 1) {
                if (/^\d+$/.test(arguments[0])) options.microsecond = arguments[0];
                else if (typeof arguments[0] === "string") {
                    options.format = arguments[0];
                }
            }
            if (arguments.length == 2) {
                options.format = format;
                options.microsecond = microsecond;
            }
            date = new Date();
            date.setTime(parseInt(options.microsecond));
            //��ʼ�滻
            outPutArr.push(options.format);
            outPutArr.key = "";
            for (var key in mapTable) {
                doSplit(outPutArr, key);
            }
            return doJoin(outPutArr);

            //ѭ����������
            function doSplit(array, key) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i] instanceof Array) arguments.callee(array[i], key);
                    else {
                        var newArr = [];
                        newArr = array[i].split(key);
                        //����ƥ����
                        if (newArr.length > 1) {
                            newArr.key = key;
                            array[i] = newArr;
                        }
                    }
                }
            }

            //�������飬�����ʽ�����ʱ���ַ���
            function doJoin(array) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i] instanceof Array) {
                        array[i] = arguments.callee(array[i]);
                    }
                }
                return array.join(mapTable[array.key] && mapTable[array.key](date) || "");
            }
        },

        /**
		 * ��ȡ��Ŀ¼
		 * @author Ymj Created at 2012-11-27
		 */
        getBasePath: function () {
            var head = document.getElementsByTagName("head")[0],
				basePath = "",
				math;
            for (var i = 0, len = head.childNodes.length; i < len; i++) {
                if (head.childNodes[i].nodeType != 1 || head.childNodes[i].nodeName.toLowerCase() != "script") continue;
                math = /^(?:(?:http|https):\/\/[^\/]+)?([\w\W]*)static\/common\/js\/tool\.js$/.exec(head.childNodes[i].src);
                if (math && math[1]) {
                    basePath = math[1];
                    break;
                }
            }
            return basePath;
        },

        /**
		 * Dialog��
		 * 
		 * ����Object���ṩ�������ڿ���Dialog������رա��ƶ��ȶ�����
		 * @author Ymj created at 2012-11-28
		 * @return Object
		 */
        miniDialog: function (options) {
            //Ĭ�ϲ���
            var defaults = {
                width: 300,										//Ĭ�Ͽ��
                position: 'fixed',									//���뷽ʽ��absoluteΪ����ĵ���fixedΪ�����Ļ
                top: null,											//���붥����Ϊnull����
                left: null,										//������࣬Ϊnull����
                className: "",										//�Զ�����ʽ�������ʽ�ÿո����
                id: "miniDialog",									//������ID
                unique: false,										//�Ƿ�ֻ�����һ��������
                back: true,										//�Ƿ��������ڱβ�
                header: true,										//�Ƿ���ڱ�����
                openBtn: true,										//�Ƿ���ڵײ���ť��
                btns: [{											//��ť�б�
                    value: "�ر�",									//��ť��ʾ�ı�
                    className: "dialog-cancel",					//��ť�Զ�����ʽ
                    callBack: function (handle) { return false; }		//��ť������󴥷��Ļص�������������FLASE���رյ�����
                }],
                beforeOpen: function () { },							 //�򿪵�����ǰ������������FALSE����ֹ�����㶯��
                afterOpen: function (handle) { },					     //�򿪵�����󴥷�
                beforeClose: function () { },						     //�رյ�����ǰ������������FALSE����ֹ�ر�
                afterClose: function () { },							 //�رյ�����󴥷�
                title: "��ʾ��Ϣ",									 //���������
                content: "",										 //��������������
                destroy: true,										 //�رպ��Ƿ�����Ԫ��
                autoCenter: false,									 //�Ƿ��Զ�����
                allowMove: true,									 //�Ƿ������ƶ� 
                autoSize: true										 //Ԫ�ظ߶ȱ仯ʱ��ȡ������Ϊ��׼�����������
            },
            opts = $.extend({}, defaults),
            delay = null,
            handle = {													  //���ؾ�������ڿ��Ƶ�����
                close: close,											  //�رպ���
                destroy: destroy,										  //���ٺ���
                setPosition: setPosition,								  //����λ��	
                open: open,											  //�򿪺���
                setContent: setContent
            },
            models = ['error', 'warn', 'succ'],
            model = '';
            if ('[object String]' === Object.prototype.toString.call(options) && $.inArray(options, models) !== -1) {
                model = options;
                options = arguments[1];
            }
            if ('[object Object]' === Object.prototype.toString.call(options)) {
                $.extend(opts, options);
            } else if ('[object String]' === Object.prototype.toString.call(options)) {
                $.extend(opts, {
                    content: options
                });
            }

            if (!!model) {
                opts.content = '<div class="dialog-model ' + model + '"><i class="ico-tips"></i>' + opts.content + '</div>';
            }

            if (opts.beforeOpen() === false) return false;
            //����ID�ж��Ƿ�Ψһ�򿪵ĵ�����
            if (opts.unique && document.getElementById(opts.id) != null && opts.destroy == true) {
                return false;
            }
            else if (document.getElementById(opts.id) != null && opts.destroy == false) {
                opts.back && $("#" + opts.id + "-back").css({
                    display: "block",
                    width: 996 >= $('body').width() ? 996 : $('body').width(),
                    height: $(document).height(),
                    "z-index": zIndex++
                });
                $("#" + opts.id).css({
                    top: makeTopLeft('top'),
                    left: makeTopLeft('left'),
                    display: "block",
                    "z-index": zIndex++
                });
            }
            else {
                $("body").append(makeHtml().replace("${title}", opts.title).replace("${content}", opts.content));
                //����ײ���ť
                var btnDiv = $("body").find("#" + opts.id + " .dialog-button")[0] || null;
                if (btnDiv) {
                    for (var i = 0; i < opts.btns.length; i++) {
                        (function () {
                            var btn = document.createElement("input"), callBack;
                            btn.type = "button";
                            btn.className = "dialog-btn";
                            btn.value = opts.btns[i].value;
                            $(btn).addClass(opts.btns[i].className);
                            callBack = opts.btns[i].callBack;
                            if (typeof callBack == "function") {
                                $(btn).bind("click", function (e) {
                                    //�ص���������FALSEʱ�رյ�����
                                    callBack(handle) === false && close(e);
                                });
                            }
                            btnDiv.appendChild(btn);
                        })();
                    }
                }
                //�����Զ�����ʽ��
                $("#" + opts.id).addClass(opts.className);
                //�����ڱβ㱳��
                opts.back && $("#" + opts.id + "-back").css({
                    display: "block",
                    width: 996 >= $('body').width() ? 996 : $('body').width(),
                    height: $(document).height(),
                    "z-index": zIndex++
                });
                //��ʼ����������ʽ
                $("#" + opts.id).css({
                    display: "block",
                    width: opts.width,
                    "z-index": zIndex++,
                    position: 'absolute',
                    overflow: 'hidden',
                    visibility: "hidden",
                    top: 0,
                    left: 0
                }).css({
                    top: makeTopLeft('top'),
                    left: makeTopLeft('left'),
                    visibility: "visible"
                });
                //������򿪺�ִ��afterOpen���������뵯������
                opts.afterOpen(handle);

                //ҳ��ı�ʱ
                $(window).bind("resize", function () {
                    //���µ����������С
                    opts.back && $("#" + opts.id + "-back").css({
                        //TODO �ĵ���С���
                        width: 996 >= $('body').width() ? 996 : $('body').width(),
                        height: $(document).height()
                    });
                });
                //�����Ƿ������Զ�����λ�þ���
                if (opts.autoCenter) {
                    $(window).bind("resize scroll", function () {
                        //���õ�����λ�ã�1��ĵȴ�ʱ��
                        setPosition();
                    });
                }

                //�����Զ�����
                if (opts.autoSize) {

                }

                //��Ԫ���ƶ�
                if (opts.allowMove) {
                    var header = $("#" + opts.id).find(".dialog-header").addClass("dialog-move")[0],
                        bindState = false,
                        x,
                        y;
                    //TODO
                    $(header).bind("mousedown", function (event) {
                        event.preventDefault();
                        //��¼��갴��ʱλ��
                        x = event.pageX;
                        y = event.pageY;
                        $(document).bind("mousemove", move);
                        bindState = true;
                    });
                    $(document).bind("mouseup", function (event) {
                        if (bindState == true) {
                            $(document).unbind("mousemove", move);
                            bindState = false;
                        }
                    });

                    function move(event) {
                        var newLeft = parseInt($("#" + opts.id).css("left")) + event.pageX - x,
							newTop = parseInt($("#" + opts.id).css("top")) + event.pageY - y;
                        //��λ��δ�����仯ʱ���ƶ�
                        if (event.pageX - x == 0 && event.pageY - y == 0) return;
                        //���������ĵ��߽�
                        if ($(document).width() < newLeft + $("#" + opts.id).width())
                            newLeft = $(document).width() - $("#" + opts.id).width();
                        if (newLeft < 0) newLeft = 0;
                        if ($(document).height() < newTop + $("#" + opts.id).height())
                            newTop = $(document).height() - $("#" + opts.id).height();
                        if (newTop < 0) newTop = 0;
                        //�ƶ�
                        $("#" + opts.id).css({
                            "top": newTop,
                            "left": newLeft
                        });
                        x = event.pageX;
                        y = event.pageY;
                    }

                }

                //�󶨹رհ�ť�¼�
                $("#" + opts.id + " .dialog-close").bind("click", close);
            }
            return handle;

            //���ص�����λ��
            function makeTopLeft(point) {
                if (point == 'left') {
                    return (opts.position == 'fixed' ? $(document).scrollLeft() : 0) + (opts.left == null ? ($(window).width() - $("#" + opts.id).width()) / 2 : parseInt(opts.left));
                }
                else {
                    return (opts.position == 'fixed' ? $(document).scrollTop() : 0) + (opts.top == null ? ($(window).height() - $("#" + opts.id).height()) / 2 : parseInt(opts.top));
                }
            }

            //����HTML
            function makeHtml() {
                //���������
                var ieClass = "";
                if ($.browser.msie && parseInt($.browser.version) <= 8) {
                    ieClass = "ie-lower";
                }
                var htmlStr = "";
                if (opts.back) htmlStr += '<div id="' + opts.id + '-back" class="dialog-mask" style="display:none;"></div>';
                htmlStr += '<div id="' + opts.id + '" class="' + ieClass + ' dialog-outer" style="display: none;">'
                         //+ '<div class="dialog-top"><div class="dialog-tl"></div><div class="dialog-tc"></div><div class="dialog-tr"></div></div>'
                         + '<table width="100%" border="0" cellspacing="0" cellpadding="0">'
                         + '<tbody>'
                         + '<tr><!--<td class="dialog-cl"></td>-->'
                         + '<td class="dialog-main">';
                if (opts.header) htmlStr += '<div class="dialog-header"><div class="dialog-title">${title}</div><a href="javascript:;" onclick="return false" class="dialog-close"></a></div>';
                htmlStr += '<div class="dialog-content">${content}</div>';
                if (opts.openBtn) {
                    htmlStr += '<div class="dialog-button"></div>';
                }
                htmlStr += '</td>'
                         + '<!--<td class="dialog-cr">--></td></tr>'
                         + '</tbody>'
                         + '</table>'
                         //+ '<div class="dialog-bot"><div class="dialog-bl"></div><div class="dialog-bc"></div><div class="dialog-br"></div></div>'
                         + '</div>';
                return htmlStr;
            }

            //�رպ���
            function close(event) {
                //��ֹð��
                if (event)
                    event.preventDefault();
                //ִ�йر�ǰ�Ķ�����������FALSE��ֹͣ����
                if (opts.beforeClose() === false) return false;
                //�ж�������Ԫ�ػ�������Ԫ��
                if (opts.destroy === false) {
                    $("#" + opts.id + "-back").hide();
                    $("#" + opts.id).hide();
                } else {
                    //�������ٺ���
                    destroy();
                }
                //ִ�йرպ�Ķ���
                opts.afterClose();
            }

            //���ٺ���
            function destroy() {
                //�����
                $("#" + opts.id + " .dialog-ok,#" + opts.id + " .dialog-cancel,#" + opts.id + " .dialog-close").unbind();
                $(window).unbind("resize scroll", setPosition);
                $("#" + opts.id + " .dialog-button input").unbind();
                $("#" + opts.id + " .dialog-close").unbind();
                //ɾ��Ԫ��
                $("#" + opts.id + "-back").remove();
                $("#" + opts.id).remove();
            }

            function setContent(content) {
                $("#" + opts.id + " .dialog-content").html(content);
            }

            //���õ�����λ��
            function setPosition() {
                clearTimeout(delay);
                //ֹͣ����
                $("#" + opts.id).stop();
                delay = setTimeout(function () {
                    var left, top;
                    top = $(document).scrollTop() + (opts.top == null ? ($(window).height() - $("#" + opts.id).height()) / 2 : parseInt(opts.top));
                    left = $(document).scrollLeft() + (opts.left == null ? ($(window).width() - $("#" + opts.id).width()) / 2 : parseInt(opts.left));
                    $("#" + opts.id).animate({
                        top: top,
                        left: left
                    });
                }, 1000);
            }

            //�򿪺���
            function open() {
                opts.back && $("#" + opts.id + "-back").css({
                    display: "block",
                    width: 996 >= $('body').width() ? 996 : $('body').width(),
                    height: $(document).height(),
                    "z-index": zIndex++
                });
                $("#" + opts.id).css({
                    top: makeTopLeft('top'),
                    left: makeTopLeft('left'),
                    display: "block",
                    "z-index": zIndex++
                });
                // ������򿪺�ִ��afterOpen���������뵯������
                opts.afterOpen(handle);
            }
        },

        /**
		 * ��¼������
		 * @author Ymj created at 2012-11-27
		 */
        loginDialog: function (options) {
            if (typeof options == "function")
                options = { success: options };
            //Ĭ�ϲ���
            var defaults = {
                width: 600,
                url: "/do/user/checkLogin",						//�����¼����ĵ�ַ
                success: function (handle) {							//��¼�ɹ���Ļص�����
                    // �رյ�����
                    handle.close();
                },
                rsuccess: function (handle) {							// ע��ɹ��Ļص�����
                    handle.close();
                },
                rerror: function (handle) {							// ע��ʧ�ܵĻص�����

                },
                error: function (handle) {							//��¼ʧ�ܵĻص�����

                },
                className: "login-dialog",							//�Զ�����ʽ�������ʽ�ÿո����
                id: "loginDialog",									//��¼������ID
                back: true,										//�Ƿ��������ڱβ�
                title: '<ul class="login-type clearfix"><li class=""><a href="javascript:;">�ʺŵ�¼</a></li><li class=""><a href="javascript:;">�û�ע��</a></li></ul>',
                hasTip: false,										//�Ƿ��е�¼��ʾ
                openBtn: false,
                unique: true,
                beforeClose: function () {							 //�ر�ǰ�����
                    $("#ajax_login_fail,#ajaxLoginForm .text,#ajax_login_code,#ajax_login_look,#login_dialog_bt,input[name='code'],#remain_me").unbind();
                    $('#' + opts.id).undelegate();
                },
                afterClose: function () { },
                top: 150,
                selected: 0											// ����ѡ��ı�ǩ
            };
            var opts = $.extend(defaults, options);

            function makeHtml() {
                var htmlStr = "";
                htmlStr += '<div id="' + opts.id + '_wrap"><div class="login_box clearfix">'
                         + '<div class="login_form"><form id="ajaxLoginForm" class="">'
                         + (opts.hasTip ? '<div class="item tips"><p class="error">Ϊ�˼������Ĳ��������ȵ�¼</p></div>' : '')
                         + '<div class="item">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-phone"></i>'
                         + '<label class="placeholder" for="username">�������¼�˺�/����/�ֻ���</label>'
                         + '<input type="text" name="username" class="text" maxlength="50" autocomplete="off" />'
                         + '</div>'
                         + '<p id="ajax_login_fail" class="w-err"></p>'
                         + '</div>'
                         + '<div class="item">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-pass"></i>'
                         + '<label class="placeholder" for="password">����</label>'
                         + '<input type="password" name="password" class="text"></div>'
                         + '</div>'
                         + '<div class="item img-code">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-code"></i>'
                         + '<label class="placeholder register-phone" for="logincode">��֤��</label>'
                         + '<input type="text" name="logincode" class="text register-phone" maxlength="6" autocomplete="off" />'
                         + '<img src="/user/loginCode" title="�����һ��">'
                         + '</div>'
                         + '</div>'
                         + '<div class="item clearfix">'
                         + '<a href="javascript:;" class="remember-me on"><i></i>��ס�ҵĵ�¼״̬</a>'
                         + '</div>'
                         + '<div class="item clearfix">'
                         + '<span class="l w-login-bt">'
                         + '<a href="javascript:" id="login_dialog_bt" class="btn-login">��¼</a>'
                         + '</span>'
                         + '<span class="l">'
                         + '<a href="/getpass.html" class="forget-pass" target="_blank">�������룿</a>'
                         + '</span>'
                         + '</div>'
                         + '</form>'
                         + '<form id="ajaxRegisterForm">'
                         + '<div class="item">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-code"></i>'
                         + '<label class="placeholder" for="username">�û���</label>'
                         + '<input type="text" name="username" class="text" autocomplete="off" maxlength="32"></div>'
                         + '<p id="ajax_register_fail" class="w-err"></p>'
                         + '</div>'
                         + '<div class="item">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-pass"></i>'
                         + '<label class="placeholder" for="password">��¼����</label>'
                         + '<input type="password" name="password" class="text"></div>'
                         + '</div>'
                         + '<div class="item">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-pass"></i>'
                         + '<label class="placeholder" for="rpassword">ȷ������</label>'
                         + '<input type="password" name="rpassword" class="text"></div>'
                         + '</div>'
                         + '<div class="item img-code">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-code"></i>'
                         + '<label class="placeholder register-phone" for="imgcode">��֤��</label>'
                         + '<input type="text" name="imgcode" class="text register-phone" maxlength="6" autocomplete="off" />'
                         + '<img src="/user/imgcode" title="�����һ��">'
                         + '</div>'
                         + '</div>'
                         + '<div class="item clearfix">'
                         + '<p class="remember-me on"><i></i>�����Ķ�������<a href="/aboutus.html#id=service_clause" target="_blank">���������</a></p>'
                         + '</div>'
                         + '<div class="item clearfix">'
                         + '<span class="l w-login-bt">'
                         + '<a href="javascript:" id="register_dialog_bt" class="btn-login">ע��</a>'
                         + '</span>'
                         + '<span class="l">'
                         + '<a target="_blank" href="javascript:;" class="go-login">�����ʺţ����ϵ�¼</a>'
                         + '</span>'
                         + '</div></form></div>'
                         + '<div class="connect-login">'
                         + '<p>ʹ�õ�������վ�˺ŵ�¼</p>'
                         + '<a class="btn-connect qq" href="javascript:"><i class="ico-app ico-qq"></i>QQ ��¼</a>'
                         + '<a class="btn-connect sina" href="javascript:"><i class="ico-app ico-weibo"></i>΢����¼</a>'
                         + '</div></div>';
                return htmlStr;
            }
            opts.content = makeHtml();
            var handle = this.miniDialog(opts);
            var screen_mid_width = (window.screen.availWidth - 700) / 2, screen_mid_height = (window.screen.availHeight - 500) / 2;
            // ѡ�������õı�ǩ
            selectTab(opts.selected | 0);
            // ��ͷ��tab�л�
            $('#' + opts.id).delegate('.dialog-title .login-type a', 'click', function () {
                var $parent = $(this).parent(), index = $parent.index();
                selectTab(index);
            }).delegate('.remember-me', 'click', function () {
                $(this).toggleClass('on');
            }).delegate('#ajaxRegisterForm .remember-me a', 'click', function (e) {
                e.stopPropagation();
            }).delegate('.go-login', 'click', function () {
                // ��ע���ǩ��ת����¼��ǩ
                selectTab(0);
                return false;
            }).delegate('.qq', 'click', function () {
                window.open("/do/user/openLogin?type=qq", "newwin", "top=" + screen_mid_height + ",left=" + screen_mid_width + ",width=700,height=500");
            }).delegate('.sina', 'click', function () {
                window.open("/do/user/openLogin?type=sina", "newwin", "top=" + screen_mid_height + ",left=" + screen_mid_width + ",width=700,height=500");
            }).delegate('#login_dialog_bt', 'click', login)		//�󶨵�¼��ť
            .delegate('#ajaxRegisterForm .img-code img', 'click', changeCode)
            .delegate('#ajaxLoginForm .img-code img', 'click', changeCode)
            .delegate('#ajaxRegisterForm .btn-getCode', 'click', function () {
                // ��ȡ�ֻ���֤��
                var args = arguments;
                if (args.callee.getting > 0) {
                    $.alert('�ף����Ĳ�������Ƶ��Ŷ', $(this));
                    return false;
                }
                var $phone = $('#ajaxRegisterForm input[name="rusername"]'),
                    phone = $phone.val(),
                    $code = $('#ajaxRegisterForm input[name="imgcode"]'),
                    code = $code.val();
                if (!code) {
                    $.alert('�ף���֤�벻��Ϊ��Ŷ', $code);
                    $code.focus();
                    return false;
                }
                if (!/[a-z0-9]{4}/i.test(code)) {
                    $.alert('�ף�����д����֤���ʽ����Ŷ', $code);
                    $code.focus().select();
                    return false;
                }
                if (!phone) {
                    $.alert('�ף��ֻ����벻��Ϊ��Ŷ', $phone);
                    $phone.focus();
                    return false;
                }
                if (!/^(13[0-9]|147|170|177|15[^4\D]|18[^14\D])\d{8}$/.test(phone)) {
                    $.alert('�ף�����д���ֻ������ʽ����Ŷ', $phone);
                    $phone.focus().select();
                    return false;
                }
                args.callee.getting = 1;
                $.openLoading('����Ŭ�����Ͷ��ţ������ĵȴ�');
                $.post('/user/regcode', { phone: phone, code: code }, function (data) {
                    $.closeLoading();
                    if (data.success) {
                        // ���õ���ʱ
                        $.openSuccess(data.error || '���ŷ��ͳɹ�����ע�⼰ʱ����Ŷ��', 3000);
                        args.callee.getting = 2;
                        var limit = 119, interval = null, $btn = $('#ajaxRegisterForm .btn-getCode');
                        (function () {
                            interval = setInterval(function () {
                                if (limit) {
                                    $btn.text('�ȴ�' + limit + '��');
                                    limit--;
                                } else {
                                    $btn.text('��ȡ��֤��');
                                    clearInterval(interval);
                                    args.callee.getting = 0;
                                }
                            }, 1000);
                        })();
                    } else {
                        args.callee.getting = 0;
                        $.openError(data.error || '��Ǹ��δ֪�������Ժ�����', 2000);
                    }
                }, 'json').error(function () {
                    args.callee.getting = 0;
                    $.openError('��Ǹ��δ֪�������Ժ�����', 2000);
                });
            }).delegate('#register_dialog_bt', 'click', register)
            .delegate('#ajaxRegisterForm input[name="imgcode"], #ajaxRegisterForm input[name="rpassword"]', 'keyup', function (e) {
                if (e.keyCode == 13) register();
            });

            function changeCode() {
                var src = $(this).attr('src').replace(/\?.*$/g, '');
                $(this).attr('src', src + '?_=' + (new Date()).getTime());
            }

            function selectTab(index) {
                var $parent = $('.dialog-title .login-type li').eq(index);
                if ($parent.hasClass('on')) return false;
                $parent.addClass('on').siblings().removeClass('on');
                // TODO �л���ͼ
                $('#' + opts.id + ' form').removeClass('on').eq(index).addClass('on');
            }
            //�õ�����
            //			 $("#ajaxLoginForm input[name='username']").focus().parent().addClass("focus-in");
            //������֤��
            //			 $("#ajax_login_code, #ajax_login_look").bind("click", function(){
            //				 var src = $("#ajax_login_code img").attr("src").split("?")[0] + "?timestamp=" + new Date().getTime();
            //				 $("#ajax_login_code img").attr("src", src);	 
            //			 });
            //��¼����֤��س���ť
            $("#ajaxLoginForm input[type='text'], #ajaxLoginForm input[type='password'], #ajaxLoginForm input[type='logincode']").bind("keyup", function (e) {
                if (e.keyCode == 13) login();
            });
            //�󶨸��ļ�ס��
            //			 $("#remain_me").bind("click", function(){
            //				 if ($(this).hasClass("remain")){
            //					 $(this).removeClass("remain").addClass("no-remain");
            //					 $("#ajaxLoginForm input[name='remain']").val(0);
            //				 }
            //				 else{
            //					 $(this).removeClass("no-remain").addClass("remain");
            //					 $("#ajaxLoginForm input[name='remain']").val(1);
            //				 }
            //			 });
            //���������
            $("#ajaxLoginForm .text, #ajaxRegisterForm .text").focus(function () {
                $(this).parent().addClass("focus-in");
            }).blur(function () {
                $(this).parent().removeClass("focus-in");
            }).keyup(function () {
                if ($(this).val() != "")
                    $(this).parent().addClass("text-hide");
                else {
                    $(this).parent().removeClass("text-hide");
                }
            });

            //			 //��������¼��ת
            //			 $(".login-dialog .connect-login a").click(function(event){
            //				 var href = $(this).attr("href");
            //				 window.location.href = href + "&return_url=" + encodeURIComponent(window.location.href);
            //				 event.preventDefault();
            //			 });

            //			 $("#login_dialog_bt").bind("click", login);
            //��¼��������
            function login() {
                var data = {},
                   $account = $("#ajaxLoginForm input[name='username']"),
                   $pass = $("#ajaxLoginForm input[name='password']"),
                   $code = $("#ajaxLoginForm input[name='logincode']");
                data.account = $account.val();
                data.password = $pass.val();
                data.code = $code.val();
                if (!data.account) {
                    $.alert('�ף���¼�˺Ų���Ϊ��Ŷ', $account);
                    $account.focus();
                    return false;
                }
                if (!/^[a-zA-Z0-9_\.@]{6,50}$/ig.test(data.account)) {
                    $.alert('�ף���¼�˺Ÿ�ʽ����Ŷ', $account);
                    $account.focus().select();
                    return false;
                }
                if (!data.password) {
                    $.alert('�ף����벻��Ϊ��Ŷ��', $pass);
                    $pass.focus();
                    return false;
                }
                if (!/^[^\u4e00-\u9fa5]{6,32}$/g.test(data.password)) {
                    $.alert('�ף���¼��������', $pass);
                    $pass.focus().select();
                    return false;
                }
                if (!/^[a-zA-Z0-9]{4}$/g.test(data.code)) {
                    $.alert('�ף���֤������', $code);
                    $code.focus().select();
                    return false;
                }
                data.remember = $("#ajaxLoginForm input.remember-me").hasClass('on') ? 1 : 0;
                $.post(opts.url, data, function (data) {
                    //ִ�лص�����������dialog��ľ��������Ϊ��������
                    if (data.success === true) opts.success(handle);
                    else {
                        //��ʾ������Ϣ
                        $("#ajax_login_fail").text(data.error || '��Ǹ��δ֪����������').slideDown('fast');
                        //������֤��
                        changeCode.call($('#ajaxLoginForm .img-code img')[0]);
                        opts.error(handle);
                    }
                }, "json").error(function () {
                    changeCode.call($('#ajaxLoginForm .img-code img')[0]);
                    $.openError('��Ǹ��δ֪�������Ժ�����', 2000);
                });
            }

            function register() {
                var args = arguments;
                var $account = $('#ajaxRegisterForm input[name="username"]'),
                    account = $account.val(),
                    $remember = $('#ajaxRegisterForm .remember-me');
                if (!$remember.hasClass('on')) {
                    $.alert('�ף�Ҫ���Ķ������ܡ��������Ŷ', $remember);
                    return false;
                }
                if (!account) {
                    $.alert('�ף��û�������Ϊ��Ŷ��', $account);
                    $account.focus();
                    return false;
                }
                if (!/^[a-zA-Z][a-zA-Z0-9_]{5,31}$/ig.test(account)) {
                    $.alert('�û�����ʽ���󣬱���Ϊ6��32λ��ĸ�����ֻ��»��� _ ����ϣ�����λ����Ϊ��ĸ', $account);
                    $account.focus().select();
                    return false;
                }
                var $code = $('#ajaxRegisterForm input[name="imgcode"]'),
                    code = $code.val(),
                    $pass = $('#ajaxRegisterForm input[name="password"]'),
                    pass = $pass.val();
                $rpass = $('#ajaxRegisterForm input[name="rpassword"]'),
                rpass = $rpass.val();
                if (!code) {
                    $.alert('�ף���֤�벻��Ϊ��Ŷ', $code);
                    $code.focus();
                    return false;
                }
                if (!/^[a-zA-Z0-9]{4}$/.test(code)) {
                    $.alert('�ף�����д����֤���ʽ����Ŷ', $code);
                    $code.focus().select();
                    return false;
                }
                if (!pass) {
                    $.alert('�ף����벻��Ϊ��Ŷ', $pass);
                    $code.focus();
                    return false;
                }
                if (!/^[^\u4e00-\u9fa5]{6,32}$/g.test(pass)) {
                    $.alert('�ף��������Ϊ6��32λ����Ӣ�ġ��ַ������Ŷ', $pass);
                    $pass.focus().select();
                    return false;
                }
                if (pass != rpass) {
                    $.alert('�ף�������������벻һ��Ŷ', $rpass);
                    $rpass.focus().select();
                    return false;
                }
                args.callee.getting = true;
                $.openLoading();
                $.post('/user/register', {
                    account: account,
                    code: code,
                    pwd: pass
                }, function (data) {
                    args.callee.getting = false;
                    $.closeLoading();
                    if (data.success) {
                        $.openSuccess(data.error || '��ϲ�ף����ѳ�Ϊsosobtc��һԱ��', 2000, function () { });
                        opts.rsuccess(handle);
                    } else {
                        //��ʾ������Ϣ
                        $("#ajax_register_fail").text(data.error || '��Ǹ��δ֪����������').slideDown('fast');
                        changeCode.call($('#ajaxRegisterForm .img-code img')[0]);
                        opts.rerror(handle);
                    }
                }, 'json').error(function () {
                    changeCode.call($('#ajaxRegisterForm .img-code img')[0]);
                    args.callee.getting = false;
                    $.openError('��Ǹ��δ֪�������Ժ�����', 2000);
                });
            }

        },

        /**
		 * ��װloginDialog ����
		 * @author Ymj created at 2013-8-19
		 */
        needLogin: function (method, url, data, successFn, closeFn) {
            var _this = this;
            //��û�в���ʱ
            if (typeof data == "function") {
                closeFn = successFn;
                successFn = data;
            }
            begin();

            function begin(handle) {
                $.ajax({
                    url: url,
                    type: method,
                    dataType: "json",
                    data: data,
                    success: function (data) {
                        if (!data.success || data.errorCode == "1") {
                            //��û��¼
                            _this.loginDialog({
                                hasTip: true,
                                success: begin,
                                afterClose: (typeof closeFn == "function" ? closeFn : function () { })
                            });
                            return false;
                        }
                        if (handle && handle.close) {
                            //�ر�
                            handle.close();
                        }
                        //�ɹ�
                        successFn(data);
                    }
                });
            }
        },


        /**
		 * �򿪼�������ʾ 
		 */
        openLoading: function (options) {
            var __self = this;
            var defaults = {
                id: "loading_" + (new Date()).getTime(),
                back: false,
                content: "���ڻ�ȡ����",
                model: "gtl_ico_clear"
            },
				backWidth = $(document).width(),
				backHeight = $(document).height(),
				htmlStr = '',
				opts;
            if (typeof options === 'string') {
                opts = $.extend(defaults, {
                    content: options
                });
            }
            else {
                opts = $.extend(defaults, options);
            }
            //�ȹر���һ�εĵ�����
            clearTimeout(loadingDely);
            __self.closeSuccess();

            if (opts.back) {
                htmlStr += '<div id="' + opts.id + '_back" style="position:absolute;width:' + backWidth + 'px;height:' + backHeight + 'px;'
						 + 'opacity: .5;filter: alpha(opacity=50);background: #90928A;top: 0px;left: 0px;z-index:'
						 + (zIndex++) + ';"'
						 + '></div>';
            }
            htmlStr += '<div id="' + opts.id + '" class="loading-wrap ' + opts.model.replace(/_/g, '-') + '" style="top:' + ($(document).scrollTop() + ($(window).height() - 60) / 2)
			         + 'px;z-index:' + (zIndex++) + ';">'
					 + '<span class="loading-outspan" style="' + 'z-index:' + (zIndex++) + ';' + '">'
					 + '<span class="' + opts.model + '"></span>'
					 + (opts.model == 'gtl_ico_clear' ? '<img src="/public/images/loading_2.gif">' : '')
					 + opts.content
					 + '<span class="gtl_end"></span>'
					 + '</span></div>';
            $("body").append(htmlStr);
            instance.push(opts.id);
            if (opts.timeout > 0) {
                //��ʱ�رյ�����
                loadingDely = setTimeout(function () {
                    __self.closeSuccess();
                    if ('function' === typeof opts.callback) opts.callback();
                }, opts.timeout);
            }
        },

        /**
		 * �رռ�������ʾ 
		 */
        closeLoading: function () {
            var id = instance[0];
            $('#' + id + '_back, #' + id).remove();
            instance.splice(0, 1);
            //			$("#loading_back, .loading-wrap").remove();
        },

        /**
		 * �򿪳ɹ���ʾ
		 */
        openSuccess: function (tip, timeout, callback) {
            var options = {
                content: tip || "�����ɹ�",
                model: "gtl_ico_succ",
                timeout: timeout || 0,
                callback: callback
            };
            this.openLoading(options);
        },

        /**
		 * �رճɹ���ʾ 
		 */
        closeSuccess: function () {
            $.closeLoading();
            //			$("#loading_back, .loading-wrap").remove();
        },

        /**
		 * ��ʧ����ʾ
		 */
        openError: function (tip, timeout) {
            var options = {
                content: tip || "����ʧ��",
                model: "gtl_ico_error",
                timeout: timeout || 0
            };
            this.openLoading(options);
        },

        /**
		 * �رճɹ���ʾ 
		 */
        closeError: function () {
            $.closeLoading();
            //			$("#loading_back, .loading-wrap").remove();
        },

        /**
		 * 
		 * @param tip
		 * @param timeout
		 * @param callback
		 * @param attachTo
		 */
        alert: function (tip, timeout, callback, attachTo, position) {
            var conf = {
                width: 'auto',
                timeout: 3000,
                callBack: function () { },
                // y���λ��
                offset: 10,
                tip: '��ʾ',
                attachTo: null,
                style: {
                    maxWidth: 300,
                    position: 'absolute',
                    top: 13,
                    left: '50%',
                    marginLeft: 550,
                    opacity: 1
                }
            }, self = this, args = arguments, opts = {}, html = '', style = {};
            if (self.isType(args[0], 'object') && args.length == 1) {
                // ��Ⱥϲ�
                self.extend(true, opts, conf, args[0]);
            } else if (self.isType(args[0], 'string')) {
                var tip = args[0], _args = Array.prototype.slice.call(args, 1);
                self.extend(true, opts, conf, {
                    tip: tip,
                    timeout: pick(_args, 'number'),
                    callBack: pick(_args, 'function'),
                    attachTo: pick(_args, 'object'),
                    style: {
                        position: pick(_args, 'string')
                    }
                });
            }
            if (opts.attachTo && self.isType(opts.attachTo, 'object')) {
                // ��дopts.style.top��opts.style.left
                opts.style.marginLeft = 0;
                opts.style.top = opts.attachTo.offset().top - 20;
                opts.style.left = opts.attachTo.offset().left + opts.attachTo.width() - 100;
            }

            for (var prop in opts.style) {
                if (prop == 'opacity') continue;
                style[prop] = opts.style[prop];
            }

            html = ['<div class="js-alert-box"><p class="js-alert-tip">',
			        opts.tip,
			        '</p></div>'].join('');
            var $alert = null;
            clearTimeout(args.callee.delay);
            if (!self.isType(opts.timeout, 'number')) {
                opts.timeout = 3000;
            }
            if ($('.js-alert-box').length) {
                // �Ѵ���alert��dom����
                $alert = $('.js-alert-box');
                if ($alert.css('display') == 'block') {
                    // ����ʾ
                    $alert.css(style).find('.js-alert-tip').html(opts.tip);
                    hideAlert();
                } else {
                    $alert.animate({
                        opacity: opts.style.opacity,
                        top: opts.style.top
                    }, 300, function () {
                        hideAlert();
                    });
                }
            } else {
                var y_start = opts.style.top - opts.offset;
                style['top'] = y_start;
                $alert = $('body').append(html).find('.js-alert-box').css({
                    width: opts.width,
                    zIndex: ++zIndex
                }).css(style).animate({
                    opacity: opts.style.opacity,
                    top: opts.style.top
                }, 300, function () {
                    hideAlert();
                });
            }

            function pick(arr, type) {
                return self.grep(arr, function (n, i) {
                    return self.isType(n, type);
                })[0];
            }

            function hideAlert() {
                args.callee.delay = setTimeout(function () {
                    $alert.animate({
                        opacity: 0,
                        top: opts.style.top - opts.offset
                    }, 300, function () {
                        $alert.remove();
                    });
                }, opts.timeout);
            }
        },

        /**
		 * ����������
		 */
        isType: function (obj, type) {
            return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() === type.toLowerCase();
        },

        loadImage: function (url) {
            // Define a "worker" function that should eventually resolve or reject the deferred object.
            var loadImage = function (deferred) {
                var image = new Image();
                // Set up event handlers to know when the image has loaded
                // or fails to load due to an error or abort.
                image.onload = loaded;
                image.onerror = errored; // URL returns 404, etc
                image.onabort = errored; // IE may call this if user clicks "Stop"
                // Setting the src property begins loading the image.
                image.src = url;
                function loaded() {
                    unbindEvents();
                    // Calling resolve means the image loaded sucessfully and is ready to use.
                    deferred.resolve(image);
                }
                function errored() {
                    unbindEvents();
                    // Calling reject means we failed to load the image (e.g. 404, server offline, etc).
                    deferred.reject(image);
                }
                function unbindEvents() {
                    // Ensures the event callbacks only get called once.
                    image.onload = null;
                    image.onerror = null;
                    image.onabort = null;
                }
            };
            // Create the deferred object that will contain the loaded image.
            // We don't want callers to have access to the resolve() and reject() methods, 
            // so convert to "read-only" by calling `promise()`.
            return $.Deferred(loadImage).promise();
        },

        LunarMaker: (function () {
            return {
                getLunarDate: function () { }
            }
        })(),

        /**
		 * ���ҳ�������
		 */
        detectZoom: function () {
            var hasPageBeenResized = function () {
                var fn, v;

                function mediaQueryMatches(property, r) {
                    var styles = document.createElement('style');
                    document.getElementsByTagName("head")[0].appendChild(styles);

                    var dummyElement = document.createElement('div');
                    dummyElement.innerHTML = "test";
                    dummyElement.id = "mq_dummyElement";
                    document.body.appendChild(dummyElement);

                    styles.sheet.insertRule('@media(' + property + ':' + r + '){#mq_dummyElement{text-decoration:underline}}', 0);
                    var matched = getComputedStyle(dummyElement, null).textDecoration == 'underline';
                    styles.sheet.deleteRule(0);
                    document.body.removeChild(dummyElement);
                    document.getElementsByTagName("head")[0].removeChild(styles);
                    return matched;
                };

                function mediaQueryBinarySearch(property, unit, a, b, maxIter, epsilon) {
                    var mid = (a + b) / 2;
                    if (maxIter == 0 || b - a < epsilon) return mid;
                    if (mediaQueryMatches(property, mid + unit)) {
                        return mediaQueryBinarySearch(property, unit, mid, b, maxIter - 1, epsilon);
                    } else {
                        return mediaQueryBinarySearch(property, unit, a, mid, maxIter - 1, epsilon);
                    }
                };

                var fns = {
                    msie: function (v) {
                        if (v == 7) {
                            //IE7
                            var r = document.body.getBoundingClientRect();
                            return ((r.right - r.left) / document.body.offsetWidth);
                        } else if (v == 8) {
                            //IE 8
                            return (screen.deviceXDPI / screen.logicalXDPI);
                        } else if (v >= 9) {
                            //IE9+
                            return (screen.deviceXDPI / screen.systemXDPI);
                        }
                    },
                    webkit: function (v) {
                        //Webkit
                        var documentWidthCss = Math.max(
							document.documentElement.clientWidth,
							document.documentElement.scrollWidth,
							document.documentElement.offsetWidth
						);
                        return (document.width / documentWidthCss);
                    },
                    mozilla: function (v) {
                        if (v > "1.9.1" && v < "1.9.2") {
                            //Firefox 3.5 only
                            return (screen.width / mediaQueryBinarySearch('min-device-width', 'px', 0, 6000, 20, .0001));
                        } else if (parseFloat(v) >= 4) {
                            //Firefox 4+
                            return (Math.round(1000 * mediaQueryBinarySearch('min--moz-device-pixel-ratio', '', 0, 10, 20, .0001)) / 1000);
                        } else {
                            //Firefox 3.6 and lower than 3.5 - No good way to detect :(
                        }
                    }
                };

                v = $.browser.version;
                for (var prop in $.browser) {
                    if (prop != 'version') {
                        fn = prop;
                    }
                }

                function showZoomTips(z, k1, k2) {
                    if (!$('.page-resize').length) {
                        $('body').append(['<div class="page-resize">',
						                  '<span class="page-resize-text">��ҳ�����ѱ�<span id="js_id_type"></span>',
						                  '��Ϊ�˻�ø��õ�������飬������ԭ��ҳΪĬ�ϴ�С��&nbsp;����',
						                  '<span class="key-wrap" id="js_id_key1"><span class="key-name">Ctrl</span></span>��',
						                  '<span class="key-wrap" id="js_id_key2"><span class="key-name">0</span></span></span>',
						                  '<a href="javascript:;" class="page-resize-link" id="js_id_resize_noshow">������ʾ</a>',
						                  '<a href="javascript:;" class="btn-close" id="js_resize_close">�ر�</a></div>'].join(''));
                        $(document).delegate('#js_resize_close', 'click', function () {
                            $('.page-resize').hide();
                        }).delegate('#js_id_resize_noshow', 'click', function () {
                            $('.page-resize').hide();
                            $.cookie('js_id_resize_noshow', true);
                        });
                    }
                    var $pageResize = $('.page-resize'),
						type = z > 1 ? 2 : z < 1 ? 0 : 1,
						text = ['��С', '', '�Ŵ�'];
                    $pageResize.find('#js_id_type').text(text[type]);
                    if (type == 1) {
                        $pageResize.hide();
                    } else {
                        $pageResize.show();
                    }
                }

                return (function () {
                    if ($.cookie('js_id_resize_noshow')) return false;
                    var zoom = fns[fn](v);
                    showZoomTips(zoom);
                });
                //return isResized;
            }();

            hasPageBeenResized();

            $(window).on('resize', hasPageBeenResized);
        }
    });

    (function () {
        var pluses = /\+/g;

        function decode(s) {
            if (config.raw) {
                return s;
            }
            return decodeURIComponent(s.replace(pluses, ' '));
        }

        function decodeAndParse(s) {
            if (s.indexOf('"') === 0) {
                // This is a quoted cookie as according to RFC2068, unescape...
                s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }

            s = decode(s);

            try {
                return config.json ? JSON.parse(s) : s;
            } catch (e) { }
        }

        var config = $.cookie = function (key, value, options) {

            // Write
            if (value !== undefined) {
                options = $.extend({}, config.defaults, options);

                if (typeof options.expires === 'number') {
                    var days = options.expires, t = options.expires = new Date();
                    t.setDate(t.getDate() + days);
                }

                value = config.json ? JSON.stringify(value) : String(value);

                return (document.cookie = [
					config.raw ? key : encodeURIComponent(key),
					'=',
					config.raw ? value : encodeURIComponent(value),
					options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
					options.path ? '; path=' + options.path : '',
					options.domain ? '; domain=' + options.domain : '',
					options.secure ? '; secure' : ''
                ].join(''));
            }

            // Read
            var cookies = document.cookie.split('; ');
            var result = key ? undefined : {};
            for (var i = 0, l = cookies.length; i < l; i++) {
                var parts = cookies[i].split('=');
                var name = decode(parts.shift());
                var cookie = parts.join('=');

                if (key && key === name) {
                    result = decodeAndParse(cookie);
                    break;
                }

                if (!key) {
                    result[name] = decodeAndParse(cookie);
                }
            }

            return result;
        };

        config.defaults = {};

        $.removeCookie = function (key, options) {
            if ($.cookie(key) !== undefined) {
                // Must not alter options, thus extending a fresh object...
                $.cookie(key, '', $.extend({}, options, { expires: -1 }));
                return true;
            }
            return false;
        };
    })();

    /*
	 HTML5 Shiv v3.7.0 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
	*/
    (function (fn) {
        if ($.browser.msie && $.browser.version < 9) {
            fn(window, document);
        }
    })(function (l, f) {
        function m() {
            var a = e.elements;
            return "string" == typeof a ? a.split(" ") : a
        }
        function i(a) {
            var b = n[a[o]];
            b || (b = {}, h++, a[o] = h, n[h] = b);
            return b
        }
        function p(a, b, c) {
            b || (b = f);
            if (g)
                return b.createElement(a);
            c || (c = i(b));
            b = c.cache[a] ? c.cache[a].cloneNode() : r.test(a) ? (c.cache[a] = c.createElem(a)).cloneNode() : c.createElem(a);
            return b.canHaveChildren && !s.test(a) ? c.frag.appendChild(b) : b
        }
        function t(a, b) {
            if (!b.cache)
                b.cache = {}, b.createElem = a.createElement, b.createFrag = a.createDocumentFragment, b.frag = b.createFrag();
            a.createElement = function (c) {
                return !e.shivMethods ? b.createElem(c) : p(c, a, b)
            };
            a.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + m().join().replace(/[\w\-]+/g, function (a) {
                b.createElem(a);
                b.frag.createElement(a);
                return 'c("' + a + '")'
            }) + ");return n}")(e, b.frag)
        }
        function q(a) {
            a || (a = f);
            var b = i(a);
            if (e.shivCSS && !j && !b.hasCSS) {
                var c, d = a;
                c = d.createElement("p");
                d = d.getElementsByTagName("head")[0] || d.documentElement;
                c.innerHTML = "x<style>article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}</style>";
                c = d.insertBefore(c.lastChild, d.firstChild);
                b.hasCSS = !!c
            }
            g || t(a, b);
            return a
        }
        var k = l.html5 || {}, s = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i, r = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i, j, o = "_html5shiv", h = 0, n = {}, g;
        (function () {
            try {
                var a = f.createElement("a");
                a.innerHTML = "<xyz></xyz>";
                j = "hidden" in a;
                var b;
                if (!(b = 1 == a.childNodes.length)) {
                    f.createElement("a");
                    var c = f.createDocumentFragment();
                    b = "undefined" == typeof c.cloneNode ||
	                "undefined" == typeof c.createDocumentFragment || "undefined" == typeof c.createElement
                }
                g = b
            } catch (d) {
                g = j = !0
            }
        })();
        var e = {
            elements: k.elements || "abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video", version: "3.7.0", shivCSS: !1 !== k.shivCSS, supportsUnknownElements: g, shivMethods: !1 !== k.shivMethods, type: "default", shivDocument: q, createElement: p, createDocumentFragment: function (a, b) {
                a || (a = f);
                if (g)
                    return a.createDocumentFragment();
                for (var b = b || i(a), c = b.frag.cloneNode(), d = 0, e = m(), h = e.length; d < h; d++)
                    c.createElement(e[d]);
                return c
            }
        };
        l.html5 = e;
        q(f)
    });

    /*! jQuery JSON plugin v2.5.1 | github.com/Krinkle/jquery-json */
    !function ($) { "use strict"; var escape = /["\\\x00-\x1f\x7f-\x9f]/g, meta = { "\b": "\\b", "	": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" }, hasOwn = Object.prototype.hasOwnProperty; $.toJSON = "object" == typeof JSON && JSON.stringify ? JSON.stringify : function (a) { if (null === a) return "null"; var b, c, d, e, f = $.type(a); if ("undefined" === f) return void 0; if ("number" === f || "boolean" === f) return String(a); if ("string" === f) return $.quoteString(a); if ("function" == typeof a.toJSON) return $.toJSON(a.toJSON()); if ("date" === f) { var g = a.getUTCMonth() + 1, h = a.getUTCDate(), i = a.getUTCFullYear(), j = a.getUTCHours(), k = a.getUTCMinutes(), l = a.getUTCSeconds(), m = a.getUTCMilliseconds(); return 10 > g && (g = "0" + g), 10 > h && (h = "0" + h), 10 > j && (j = "0" + j), 10 > k && (k = "0" + k), 10 > l && (l = "0" + l), 100 > m && (m = "0" + m), 10 > m && (m = "0" + m), '"' + i + "-" + g + "-" + h + "T" + j + ":" + k + ":" + l + "." + m + 'Z"' } if (b = [], $.isArray(a)) { for (c = 0; c < a.length; c++) b.push($.toJSON(a[c]) || "null"); return "[" + b.join(",") + "]" } if ("object" == typeof a) { for (c in a) if (hasOwn.call(a, c)) { if (f = typeof c, "number" === f) d = '"' + c + '"'; else { if ("string" !== f) continue; d = $.quoteString(c) } f = typeof a[c], "function" !== f && "undefined" !== f && (e = $.toJSON(a[c]), b.push(d + ":" + e)) } return "{" + b.join(",") + "}" } }, $.evalJSON = "object" == typeof JSON && JSON.parse ? JSON.parse : function (str) { return eval("(" + str + ")") }, $.secureEvalJSON = "object" == typeof JSON && JSON.parse ? JSON.parse : function (str) { var filtered = str.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""); if (/^[\],:{}\s]*$/.test(filtered)) return eval("(" + str + ")"); throw new SyntaxError("Error parsing JSON, source is not valid.") }, $.quoteString = function (a) { return a.match(escape) ? '"' + a.replace(escape, function (a) { var b = meta[a]; return "string" == typeof b ? b : (b = a.charCodeAt(), "\\u00" + Math.floor(b / 16).toString(16) + (b % 16).toString(16)) }) + '"' : '"' + a + '"' } }(jQuery);


    /**
	 * ���󼶱�Ĳ��
	 */
    $.fn.extend({
        /**
		 * �����ֶ�̬�任Ч��
		 * Create By YMJ At 2013-01-14
		 */
        toggleInt: function (value, duration) {
            var element;
            if (isNaN(value = parseInt(value))) return this;
            duration = parseInt(duration) || 1000;
            //���ʱ��Ϊ100����
            duration = duration < 100 ? 100 : duration;
            for (var i = 0, l = this.length; i < l; i++) {
                element = this[i];
                if (isNaN(parseInt(element.innerHTML))) continue;
                doAnimation(element, value, duration);
            }
            return this;
            /**
			 * ��ʼ����
			 */
            function doAnimation(ele, val, duration) {
                //����ѭ������
                var origin = parseInt(element.innerHTML), dvalue, loop, one, time, interval, doTime = 0;
                time = 20;
                dvalue = val - origin;
                dvalue = dvalue < 0 ? -dvalue : dvalue;
                one = dvalue / duration * time;
                one = one < 1 ? 1 : Math.floor(one);
                if (one == 1) {
                    time = Math.floor(duration / dvalue);
                }
                //ѭ������
                interval = Math.floor(duration / time) + (duration % time === 0 ? 0 : 1);
                one = (val - origin) < 0 ? -one : one;
                loop = setInterval(function () {
                    doTime++;
                    if (doTime === interval) {
                        element.innerHTML = val;
                        clearInterval(loop);
                        return;
                    }
                    origin = origin + one;
                    element.innerHTML = origin;
                }, time);
            }
        },

        /**
		 * ��ʽ��textarea���ݲ�����
		 * 1��ÿһ����<p>����
		 * 2��ÿһ�е�ͷ���Ŀո������ñ�ǩ<p>��text-indent��ʽ����λ�Զ���Ĭ��em
		 * 3��ÿһ�е��������ֳ��ֿո���&nbsp;���
		 * 4������script��ǩ
		 * 5������HTML��ǩ����ѡ��Ĭ�Ϲ��ˣ�
		 */
        textToHtml: function (opts) {
            var defaults = {
                headSpace: '1em',
                OtherSpace: '&nbsp;',
                htmlTag: false
            }, element, val, prelen, pre, temp;
            opts = $.extend(defaults, opts);

            if (!this.length || this.length == 0) return "";
            element = this[0];
            val = $(element).val().replace(/^(?:[\s\r\t\f\n]*\n)?([\w\W]*?)[\s\n\r\f\t]*$/, '$1').split(/\n/);
            //Ϊ��ʱ
            if (val.length == 1 && val[0] == "") return "";
            //��λ
            temp = opts.headSpace.match(/^([\d\.]*)([a-zA-Z]*)$/);
            for (var i = 0; i < val.length; i++) {
                //����ǰ�ÿո�����
                pre = val[i].replace(/^(\s*)[\w\W]*$/, '$1').match(/\s/g);
                prelen = (pre ? pre.length : 0);
                val[i] = val[i].replace(/^\s*([\w\W]*)$/, '$1').replace(/\s/g, opts.OtherSpace);
                //��ȥSCRIPT��ǩ
                val[i].replace(/<script([^>]*)>([^<]*)<\/script>/g, '&lt;script$1&gt;$2&lt;/script&gt;');
                //������Ҫ��ȥ����html��ǩ
                if (!opts.htmlTag) {
                    val[i] = val[i].replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    //					val[i] = val[i].replace(/<([^>\s]*)([^>]*)>([^<]*)<\/\1?>/g, '&lt;$1$2&gt;$3&lt;/$1&gt;');
                }
                //��װ
                if (prelen > 0) {
                    val[i] = '<p style="text-indent:' + (parseFloat(temp[1]) * prelen) + temp[2] + '">' + val[i] + '</p>';
                }
                else {
                    val[i] = '<p>' + val[i] + '</p>';
                }
            }
            return val.join("");
        },

        /**
		 * ���ı������input��textarea�ı�ʱ�¼�
		 */
        input: function (fn) {
            var ie = $.browser.msie;
            for (var i = 0, l = this.length; i < l; i++) {
                if (ie) {
                    (function (el) {
                        el.attachEvent("onpropertychange", function (arg) {
                            fn.call(el, window.event);
                        });
                    })(this[i]);
                }
                else {
                    this[i].addEventListener("input", fn, false);
                }
            }
            return this;
        }
    });

    // ��ֹIE�»���ajax����
    //$.ajaxSetup({cache:false});
})(window, window.jQuery);