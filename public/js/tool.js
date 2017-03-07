/**
* 基于Jquery的插件库
* 样式位于style.css
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
		zIndex = 99999;					//用于得到当前zIndex的最大值
    $.extend({
        /**
		 * 根据Key获取URL中的参数值，若不存在KEY时返回NULL，若不存在VALUE时返回空字符串
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
		 * 查找#后面参数
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
		 * 增添或修改#后面参数
		 * 需自行编码
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
                    //已存在
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
                            //直接替换hash串
                            for (name in args[0]) {
                                hash += name + '=' + args[0][name] + '&';
                            }
                            hash = hash.slice(0, -1);
                        } else {
                            //拼接hash串
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
		 * 返回头部
		 * @param {string} klass 预设值：'', 'attach-to-content'
		 */
        goToTop: function (klass) {
            if ($('.go-to-top').length) {
                $('body,html').animate({ scrollTop: 0 }, 300, 'swing');
                return;
            }
            var $goToTop = $("body").append('<div class="go-to-top"><a href="javascript:" title="返回顶部">返回顶部</a></div>')
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
		 * 格式化输出时间（参照PHP date函数）
		 * @param format
		 * 		  (默认值为"Y-m-d H:i:s")
		 * 		  Y - 4 位数字完整表示的年份 例如：1999 或 2003
		 * 		  y - 2 位数字表示的年份 例如：99 或 03 
		 * 		  m - 数字表示的月份，有前导零 01 到 12 
		 * 		  n - 数字表示的月份，没有前导零 1 到 12 
		 * 		  d - 月份中的第几天，有前导零的 2 位数字 01 到 31 
		 * 		  j - 月份中的第几天，没有前导零 1 到 31 
		 * 		  w - 星期中的第几天，数字表示 0（表示星期天）到 6（表示星期六） 
		 * 		  l - （“L”的小写字母） 星期几，完整的文本格式 星期一 到 星期天 
		 * 		  g - 小时，12 小时格式，没有前导零 1 到 12 
		 *		  G - 小时，24 小时格式，没有前导零 0 到 23 
		 * 		  h - 小时，12 小时格式，有前导零 01 到 12 
		 * 		  H - 小时，24 小时格式，有前导零 00 到 23 
		 * 		  i - 有前导零的分钟数 00 到 59
		 * 		  s - 秒数，有前导零 00 到 59
		 * 		 （其他格式待补充）
		 * @param microsecond
		 * 		  微秒数，如果没有给出则使用本地当前时间
		 */
        dateFormat: function (format, microsecond) {
            var options = {
                format: "Y-m-d H:i:s",
                microsecond: new Date().getTime()
            }, date, mapTable, outPutArr = [];
            //映射表
            mapTable = {
                'Y': function (date) { return date.getFullYear(); },
                'y': function (date) { return (date.getFullYear() + "").substr(2); },
                'm': function (date) { return date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1; },
                'n': function (date) { return date.getMonth() + 1; },
                'd': function (date) { return date.getDate() < 10 ? "0" + date.getDate() : date.getDate(); },
                'j': function (date) { return date.getDate(); },
                'w': function (date) { return date.getDay(); },
                'l': function (date) { return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()]; },
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
            //开始替换
            outPutArr.push(options.format);
            outPutArr.key = "";
            for (var key in mapTable) {
                doSplit(outPutArr, key);
            }
            return doJoin(outPutArr);

            //循环构建数组
            function doSplit(array, key) {
                for (var i = 0; i < array.length; i++) {
                    if (array[i] instanceof Array) arguments.callee(array[i], key);
                    else {
                        var newArr = [];
                        newArr = array[i].split(key);
                        //存在匹配项
                        if (newArr.length > 1) {
                            newArr.key = key;
                            array[i] = newArr;
                        }
                    }
                }
            }

            //遍历数组，输出格式化后的时间字符串
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
		 * 获取根目录
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
		 * Dialog框
		 * 
		 * 返回Object，提供方法用于控制Dialog框（诸如关闭、移动等动作）
		 * @author Ymj created at 2012-11-28
		 * @return Object
		 */
        miniDialog: function (options) {
            //默认参数
            var defaults = {
                width: 300,										//默认宽度
                position: 'fixed',									//对齐方式，absolute为相对文档，fixed为相对屏幕
                top: null,											//距离顶部，为null居中
                left: null,										//距离左侧，为null居中
                className: "",										//自定义样式，多个样式用空格隔开
                id: "miniDialog",									//弹出层ID
                unique: false,										//是否只允许打开一个弹出层
                back: true,										//是否开启背景遮蔽层
                header: true,										//是否存在标题行
                openBtn: true,										//是否存在底部按钮行
                btns: [{											//按钮列表
                    value: "关闭",									//按钮显示文本
                    className: "dialog-cancel",					//按钮自定义样式
                    callBack: function (handle) { return false; }		//按钮被点击后触发的回调函数，若返回FLASE，关闭弹出层
                }],
                beforeOpen: function () { },							 //打开弹出层前触发，若返回FALSE，终止弹出层动作
                afterOpen: function (handle) { },					     //打开弹出层后触发
                beforeClose: function () { },						     //关闭弹出层前触发，若返回FALSE，阻止关闭
                afterClose: function () { },							 //关闭弹出层后触发
                title: "提示信息",									 //弹出层标题
                content: "",										 //弹出层正文内容
                destroy: true,										 //关闭后是否销毁元素
                autoCenter: false,									 //是否自动居中
                allowMove: true,									 //是否允许移动 
                autoSize: true										 //元素高度变化时采取以中线为基准上下拉伸居中
            },
            opts = $.extend({}, defaults),
            delay = null,
            handle = {													  //返回句柄，用于控制弹出层
                close: close,											  //关闭函数
                destroy: destroy,										  //销毁函数
                setPosition: setPosition,								  //设置位置	
                open: open,											  //打开函数
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
            //根据ID判断是否唯一打开的弹出层
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
                //插入底部按钮
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
                                    //回调函数返回FALSE时关闭弹出层
                                    callBack(handle) === false && close(e);
                                });
                            }
                            btnDiv.appendChild(btn);
                        })();
                    }
                }
                //插入自定义样式类
                $("#" + opts.id).addClass(opts.className);
                //设置遮蔽层背景
                opts.back && $("#" + opts.id + "-back").css({
                    display: "block",
                    width: 996 >= $('body').width() ? 996 : $('body').width(),
                    height: $(document).height(),
                    "z-index": zIndex++
                });
                //初始化弹出层样式
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
                //弹出框打开后执行afterOpen函数，传入弹出框句柄
                opts.afterOpen(handle);

                //页面改变时
                $(window).bind("resize", function () {
                    //重新调整背景层大小
                    opts.back && $("#" + opts.id + "-back").css({
                        //TODO 文档最小宽度
                        width: 996 >= $('body').width() ? 996 : $('body').width(),
                        height: $(document).height()
                    });
                });
                //设置是否允许自动调整位置居中
                if (opts.autoCenter) {
                    $(window).bind("resize scroll", function () {
                        //重置弹出层位置，1秒的等待时间
                        setPosition();
                    });
                }

                //允许自动拉伸
                if (opts.autoSize) {

                }

                //绑定元素移动
                if (opts.allowMove) {
                    var header = $("#" + opts.id).find(".dialog-header").addClass("dialog-move")[0],
                        bindState = false,
                        x,
                        y;
                    //TODO
                    $(header).bind("mousedown", function (event) {
                        event.preventDefault();
                        //记录鼠标按下时位置
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
                        //当位置未产生变化时不移动
                        if (event.pageX - x == 0 && event.pageY - y == 0) return;
                        //不允许超出文档边界
                        if ($(document).width() < newLeft + $("#" + opts.id).width())
                            newLeft = $(document).width() - $("#" + opts.id).width();
                        if (newLeft < 0) newLeft = 0;
                        if ($(document).height() < newTop + $("#" + opts.id).height())
                            newTop = $(document).height() - $("#" + opts.id).height();
                        if (newTop < 0) newTop = 0;
                        //移动
                        $("#" + opts.id).css({
                            "top": newTop,
                            "left": newLeft
                        });
                        x = event.pageX;
                        y = event.pageY;
                    }

                }

                //绑定关闭按钮事件
                $("#" + opts.id + " .dialog-close").bind("click", close);
            }
            return handle;

            //返回弹出层位置
            function makeTopLeft(point) {
                if (point == 'left') {
                    return (opts.position == 'fixed' ? $(document).scrollLeft() : 0) + (opts.left == null ? ($(window).width() - $("#" + opts.id).width()) / 2 : parseInt(opts.left));
                }
                else {
                    return (opts.position == 'fixed' ? $(document).scrollTop() : 0) + (opts.top == null ? ($(window).height() - $("#" + opts.id).height()) / 2 : parseInt(opts.top));
                }
            }

            //生成HTML
            function makeHtml() {
                //浏览器兼容
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

            //关闭函数
            function close(event) {
                //阻止冒泡
                if (event)
                    event.preventDefault();
                //执行关闭前的动作，若返回FALSE，停止动作
                if (opts.beforeClose() === false) return false;
                //判断是销毁元素还是隐藏元素
                if (opts.destroy === false) {
                    $("#" + opts.id + "-back").hide();
                    $("#" + opts.id).hide();
                } else {
                    //调用销毁函数
                    destroy();
                }
                //执行关闭后的动作
                opts.afterClose();
            }

            //销毁函数
            function destroy() {
                //解除绑定
                $("#" + opts.id + " .dialog-ok,#" + opts.id + " .dialog-cancel,#" + opts.id + " .dialog-close").unbind();
                $(window).unbind("resize scroll", setPosition);
                $("#" + opts.id + " .dialog-button input").unbind();
                $("#" + opts.id + " .dialog-close").unbind();
                //删除元素
                $("#" + opts.id + "-back").remove();
                $("#" + opts.id).remove();
            }

            function setContent(content) {
                $("#" + opts.id + " .dialog-content").html(content);
            }

            //设置弹出层位置
            function setPosition() {
                clearTimeout(delay);
                //停止动画
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

            //打开函数
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
                // 弹出框打开后执行afterOpen函数，传入弹出框句柄
                opts.afterOpen(handle);
            }
        },

        /**
		 * 登录弹出层
		 * @author Ymj created at 2012-11-27
		 */
        loginDialog: function (options) {
            if (typeof options == "function")
                options = { success: options };
            //默认参数
            var defaults = {
                width: 600,
                url: "/do/user/checkLogin",						//发起登录请求的地址
                success: function (handle) {							//登录成功后的回调函数
                    // 关闭弹出层
                    handle.close();
                },
                rsuccess: function (handle) {							// 注册成功的回调函数
                    handle.close();
                },
                rerror: function (handle) {							// 注册失败的回调函数

                },
                error: function (handle) {							//登录失败的回调函数

                },
                className: "login-dialog",							//自定义样式，多个样式用空格隔开
                id: "loginDialog",									//登录弹出层ID
                back: true,										//是否开启背景遮蔽层
                title: '<ul class="login-type clearfix"><li class=""><a href="javascript:;">帐号登录</a></li><li class=""><a href="javascript:;">用户注册</a></li></ul>',
                hasTip: false,										//是否有登录提示
                openBtn: false,
                unique: true,
                beforeClose: function () {							 //关闭前清除绑定
                    $("#ajax_login_fail,#ajaxLoginForm .text,#ajax_login_code,#ajax_login_look,#login_dialog_bt,input[name='code'],#remain_me").unbind();
                    $('#' + opts.id).undelegate();
                },
                afterClose: function () { },
                top: 150,
                selected: 0											// 设置选择的标签
            };
            var opts = $.extend(defaults, options);

            function makeHtml() {
                var htmlStr = "";
                htmlStr += '<div id="' + opts.id + '_wrap"><div class="login_box clearfix">'
                         + '<div class="login_form"><form id="ajaxLoginForm" class="">'
                         + (opts.hasTip ? '<div class="item tips"><p class="error">为了继续您的操作，请先登录</p></div>' : '')
                         + '<div class="item">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-phone"></i>'
                         + '<label class="placeholder" for="username">请输入登录账号/邮箱/手机号</label>'
                         + '<input type="text" name="username" class="text" maxlength="50" autocomplete="off" />'
                         + '</div>'
                         + '<p id="ajax_login_fail" class="w-err"></p>'
                         + '</div>'
                         + '<div class="item">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-pass"></i>'
                         + '<label class="placeholder" for="password">密码</label>'
                         + '<input type="password" name="password" class="text"></div>'
                         + '</div>'
                         + '<div class="item img-code">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-code"></i>'
                         + '<label class="placeholder register-phone" for="logincode">验证码</label>'
                         + '<input type="text" name="logincode" class="text register-phone" maxlength="6" autocomplete="off" />'
                         + '<img src="/user/loginCode" title="点击换一张">'
                         + '</div>'
                         + '</div>'
                         + '<div class="item clearfix">'
                         + '<a href="javascript:;" class="remember-me on"><i></i>记住我的登录状态</a>'
                         + '</div>'
                         + '<div class="item clearfix">'
                         + '<span class="l w-login-bt">'
                         + '<a href="javascript:" id="login_dialog_bt" class="btn-login">登录</a>'
                         + '</span>'
                         + '<span class="l">'
                         + '<a href="/getpass.html" class="forget-pass" target="_blank">忘记密码？</a>'
                         + '</span>'
                         + '</div>'
                         + '</form>'
                         + '<form id="ajaxRegisterForm">'
                         + '<div class="item">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-code"></i>'
                         + '<label class="placeholder" for="username">用户名</label>'
                         + '<input type="text" name="username" class="text" autocomplete="off" maxlength="32"></div>'
                         + '<p id="ajax_register_fail" class="w-err"></p>'
                         + '</div>'
                         + '<div class="item">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-pass"></i>'
                         + '<label class="placeholder" for="password">登录密码</label>'
                         + '<input type="password" name="password" class="text"></div>'
                         + '</div>'
                         + '<div class="item">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-pass"></i>'
                         + '<label class="placeholder" for="rpassword">确认密码</label>'
                         + '<input type="password" name="rpassword" class="text"></div>'
                         + '</div>'
                         + '<div class="item img-code">'
                         + '<div class="w-inp clearfix">'
                         + '<i class="ico-login ico-code"></i>'
                         + '<label class="placeholder register-phone" for="imgcode">验证码</label>'
                         + '<input type="text" name="imgcode" class="text register-phone" maxlength="6" autocomplete="off" />'
                         + '<img src="/user/imgcode" title="点击换一张">'
                         + '</div>'
                         + '</div>'
                         + '<div class="item clearfix">'
                         + '<p class="remember-me on"><i></i>我已阅读并接受<a href="/aboutus.html#id=service_clause" target="_blank">《服务条款》</a></p>'
                         + '</div>'
                         + '<div class="item clearfix">'
                         + '<span class="l w-login-bt">'
                         + '<a href="javascript:" id="register_dialog_bt" class="btn-login">注册</a>'
                         + '</span>'
                         + '<span class="l">'
                         + '<a target="_blank" href="javascript:;" class="go-login">已有帐号？马上登录</a>'
                         + '</span>'
                         + '</div></form></div>'
                         + '<div class="connect-login">'
                         + '<p>使用第三方网站账号登录</p>'
                         + '<a class="btn-connect qq" href="javascript:"><i class="ico-app ico-qq"></i>QQ 登录</a>'
                         + '<a class="btn-connect sina" href="javascript:"><i class="ico-app ico-weibo"></i>微博登录</a>'
                         + '</div></div>';
                return htmlStr;
            }
            opts.content = makeHtml();
            var handle = this.miniDialog(opts);
            var screen_mid_width = (window.screen.availWidth - 700) / 2, screen_mid_height = (window.screen.availHeight - 500) / 2;
            // 选择所设置的标签
            selectTab(opts.selected | 0);
            // 绑定头部tab切换
            $('#' + opts.id).delegate('.dialog-title .login-type a', 'click', function () {
                var $parent = $(this).parent(), index = $parent.index();
                selectTab(index);
            }).delegate('.remember-me', 'click', function () {
                $(this).toggleClass('on');
            }).delegate('#ajaxRegisterForm .remember-me a', 'click', function (e) {
                e.stopPropagation();
            }).delegate('.go-login', 'click', function () {
                // 从注册标签跳转到登录标签
                selectTab(0);
                return false;
            }).delegate('.qq', 'click', function () {
                window.open("/do/user/openLogin?type=qq", "newwin", "top=" + screen_mid_height + ",left=" + screen_mid_width + ",width=700,height=500");
            }).delegate('.sina', 'click', function () {
                window.open("/do/user/openLogin?type=sina", "newwin", "top=" + screen_mid_height + ",left=" + screen_mid_width + ",width=700,height=500");
            }).delegate('#login_dialog_bt', 'click', login)		//绑定登录按钮
            .delegate('#ajaxRegisterForm .img-code img', 'click', changeCode)
            .delegate('#ajaxLoginForm .img-code img', 'click', changeCode)
            .delegate('#ajaxRegisterForm .btn-getCode', 'click', function () {
                // 获取手机验证码
                var args = arguments;
                if (args.callee.getting > 0) {
                    $.alert('亲，您的操作过于频繁哦', $(this));
                    return false;
                }
                var $phone = $('#ajaxRegisterForm input[name="rusername"]'),
                    phone = $phone.val(),
                    $code = $('#ajaxRegisterForm input[name="imgcode"]'),
                    code = $code.val();
                if (!code) {
                    $.alert('亲，验证码不能为空哦', $code);
                    $code.focus();
                    return false;
                }
                if (!/[a-z0-9]{4}/i.test(code)) {
                    $.alert('亲，您填写的验证码格式有误哦', $code);
                    $code.focus().select();
                    return false;
                }
                if (!phone) {
                    $.alert('亲，手机号码不能为空哦', $phone);
                    $phone.focus();
                    return false;
                }
                if (!/^(13[0-9]|147|170|177|15[^4\D]|18[^14\D])\d{8}$/.test(phone)) {
                    $.alert('亲，您填写的手机号码格式有误哦', $phone);
                    $phone.focus().select();
                    return false;
                }
                args.callee.getting = 1;
                $.openLoading('正在努力发送短信，请耐心等待');
                $.post('/user/regcode', { phone: phone, code: code }, function (data) {
                    $.closeLoading();
                    if (data.success) {
                        // 设置倒计时
                        $.openSuccess(data.error || '短信发送成功，请注意及时查收哦！', 3000);
                        args.callee.getting = 2;
                        var limit = 119, interval = null, $btn = $('#ajaxRegisterForm .btn-getCode');
                        (function () {
                            interval = setInterval(function () {
                                if (limit) {
                                    $btn.text('等待' + limit + '秒');
                                    limit--;
                                } else {
                                    $btn.text('获取验证码');
                                    clearInterval(interval);
                                    args.callee.getting = 0;
                                }
                            }, 1000);
                        })();
                    } else {
                        args.callee.getting = 0;
                        $.openError(data.error || '抱歉！未知错误，请稍后重试', 2000);
                    }
                }, 'json').error(function () {
                    args.callee.getting = 0;
                    $.openError('抱歉！未知错误，请稍后重试', 2000);
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
                // TODO 切换视图
                $('#' + opts.id + ' form').removeClass('on').eq(index).addClass('on');
            }
            //得到焦点
            //			 $("#ajaxLoginForm input[name='username']").focus().parent().addClass("focus-in");
            //更换验证码
            //			 $("#ajax_login_code, #ajax_login_look").bind("click", function(){
            //				 var src = $("#ajax_login_code img").attr("src").split("?")[0] + "?timestamp=" + new Date().getTime();
            //				 $("#ajax_login_code img").attr("src", src);	 
            //			 });
            //登录框验证码回车按钮
            $("#ajaxLoginForm input[type='text'], #ajaxLoginForm input[type='password'], #ajaxLoginForm input[type='logincode']").bind("keyup", function (e) {
                if (e.keyCode == 13) login();
            });
            //绑定更改记住我
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
            //输入框输入
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

            //			 //第三方登录跳转
            //			 $(".login-dialog .connect-login a").click(function(event){
            //				 var href = $(this).attr("href");
            //				 window.location.href = href + "&return_url=" + encodeURIComponent(window.location.href);
            //				 event.preventDefault();
            //			 });

            //			 $("#login_dialog_bt").bind("click", login);
            //登录触发函数
            function login() {
                var data = {},
                   $account = $("#ajaxLoginForm input[name='username']"),
                   $pass = $("#ajaxLoginForm input[name='password']"),
                   $code = $("#ajaxLoginForm input[name='logincode']");
                data.account = $account.val();
                data.password = $pass.val();
                data.code = $code.val();
                if (!data.account) {
                    $.alert('亲，登录账号不能为空哦', $account);
                    $account.focus();
                    return false;
                }
                if (!/^[a-zA-Z0-9_\.@]{6,50}$/ig.test(data.account)) {
                    $.alert('亲，登录账号格式有误哦', $account);
                    $account.focus().select();
                    return false;
                }
                if (!data.password) {
                    $.alert('亲，密码不能为空哦！', $pass);
                    $pass.focus();
                    return false;
                }
                if (!/^[^\u4e00-\u9fa5]{6,32}$/g.test(data.password)) {
                    $.alert('亲，登录密码有误！', $pass);
                    $pass.focus().select();
                    return false;
                }
                if (!/^[a-zA-Z0-9]{4}$/g.test(data.code)) {
                    $.alert('亲，验证码有误！', $code);
                    $code.focus().select();
                    return false;
                }
                data.remember = $("#ajaxLoginForm input.remember-me").hasClass('on') ? 1 : 0;
                $.post(opts.url, data, function (data) {
                    //执行回调函数，并把dialog框的句柄对象作为参数传入
                    if (data.success === true) opts.success(handle);
                    else {
                        //显示错误信息
                        $("#ajax_login_fail").text(data.error || '抱歉！未知错误，请重试').slideDown('fast');
                        //更新验证码
                        changeCode.call($('#ajaxLoginForm .img-code img')[0]);
                        opts.error(handle);
                    }
                }, "json").error(function () {
                    changeCode.call($('#ajaxLoginForm .img-code img')[0]);
                    $.openError('抱歉！未知错误，请稍后重试', 2000);
                });
            }

            function register() {
                var args = arguments;
                var $account = $('#ajaxRegisterForm input[name="username"]'),
                    account = $account.val(),
                    $remember = $('#ajaxRegisterForm .remember-me');
                if (!$remember.hasClass('on')) {
                    $.alert('亲，要先阅读并接受《服务条款》哦', $remember);
                    return false;
                }
                if (!account) {
                    $.alert('亲，用户名不能为空哦！', $account);
                    $account.focus();
                    return false;
                }
                if (!/^[a-zA-Z][a-zA-Z0-9_]{5,31}$/ig.test(account)) {
                    $.alert('用户名格式有误，必须为6到32位字母、数字或下划线 _ 的组合，且首位必须为字母', $account);
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
                    $.alert('亲，验证码不能为空哦', $code);
                    $code.focus();
                    return false;
                }
                if (!/^[a-zA-Z0-9]{4}$/.test(code)) {
                    $.alert('亲，您填写的验证码格式有误哦', $code);
                    $code.focus().select();
                    return false;
                }
                if (!pass) {
                    $.alert('亲，密码不能为空哦', $pass);
                    $code.focus();
                    return false;
                }
                if (!/^[^\u4e00-\u9fa5]{6,32}$/g.test(pass)) {
                    $.alert('亲，密码必须为6到32位任意英文、字符的组合哦', $pass);
                    $pass.focus().select();
                    return false;
                }
                if (pass != rpass) {
                    $.alert('亲，两次输入的密码不一致哦', $rpass);
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
                        $.openSuccess(data.error || '恭喜亲，您已成为sosobtc的一员！', 2000, function () { });
                        opts.rsuccess(handle);
                    } else {
                        //显示错误信息
                        $("#ajax_register_fail").text(data.error || '抱歉！未知错误，请重试').slideDown('fast');
                        changeCode.call($('#ajaxRegisterForm .img-code img')[0]);
                        opts.rerror(handle);
                    }
                }, 'json').error(function () {
                    changeCode.call($('#ajaxRegisterForm .img-code img')[0]);
                    args.callee.getting = false;
                    $.openError('抱歉！未知错误，请稍后重试', 2000);
                });
            }

        },

        /**
		 * 封装loginDialog 方法
		 * @author Ymj created at 2013-8-19
		 */
        needLogin: function (method, url, data, successFn, closeFn) {
            var _this = this;
            //但没有参数时
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
                            //还没登录
                            _this.loginDialog({
                                hasTip: true,
                                success: begin,
                                afterClose: (typeof closeFn == "function" ? closeFn : function () { })
                            });
                            return false;
                        }
                        if (handle && handle.close) {
                            //关闭
                            handle.close();
                        }
                        //成功
                        successFn(data);
                    }
                });
            }
        },


        /**
		 * 打开加载中提示 
		 */
        openLoading: function (options) {
            var __self = this;
            var defaults = {
                id: "loading_" + (new Date()).getTime(),
                back: false,
                content: "正在获取数据",
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
            //先关闭上一次的弹出层
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
                //超时关闭弹出层
                loadingDely = setTimeout(function () {
                    __self.closeSuccess();
                    if ('function' === typeof opts.callback) opts.callback();
                }, opts.timeout);
            }
        },

        /**
		 * 关闭加载中提示 
		 */
        closeLoading: function () {
            var id = instance[0];
            $('#' + id + '_back, #' + id).remove();
            instance.splice(0, 1);
            //			$("#loading_back, .loading-wrap").remove();
        },

        /**
		 * 打开成功提示
		 */
        openSuccess: function (tip, timeout, callback) {
            var options = {
                content: tip || "操作成功",
                model: "gtl_ico_succ",
                timeout: timeout || 0,
                callback: callback
            };
            this.openLoading(options);
        },

        /**
		 * 关闭成功提示 
		 */
        closeSuccess: function () {
            $.closeLoading();
            //			$("#loading_back, .loading-wrap").remove();
        },

        /**
		 * 打开失败提示
		 */
        openError: function (tip, timeout) {
            var options = {
                content: tip || "操作失败",
                model: "gtl_ico_error",
                timeout: timeout || 0
            };
            this.openLoading(options);
        },

        /**
		 * 关闭成功提示 
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
                // y轴的位移
                offset: 10,
                tip: '提示',
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
                // 深度合并
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
                // 改写opts.style.top和opts.style.left
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
                // 已存在alert的dom对象
                $alert = $('.js-alert-box');
                if ($alert.css('display') == 'block') {
                    // 已显示
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
		 * 检测对象类型
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
		 * 检测页面的缩放
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
						                  '<span class="page-resize-text">网页内容已被<span id="js_id_type"></span>',
						                  '，为了获得更好的浏览体验，请您还原网页为默认大小：&nbsp;按下',
						                  '<span class="key-wrap" id="js_id_key1"><span class="key-name">Ctrl</span></span>和',
						                  '<span class="key-wrap" id="js_id_key2"><span class="key-name">0</span></span></span>',
						                  '<a href="javascript:;" class="page-resize-link" id="js_id_resize_noshow">不再显示</a>',
						                  '<a href="javascript:;" class="btn-close" id="js_resize_close">关闭</a></div>'].join(''));
                        $(document).delegate('#js_resize_close', 'click', function () {
                            $('.page-resize').hide();
                        }).delegate('#js_id_resize_noshow', 'click', function () {
                            $('.page-resize').hide();
                            $.cookie('js_id_resize_noshow', true);
                        });
                    }
                    var $pageResize = $('.page-resize'),
						type = z > 1 ? 2 : z < 1 ? 0 : 1,
						text = ['缩小', '', '放大'];
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
	 * 对象级别的插件
	 */
    $.fn.extend({
        /**
		 * 整数字动态变换效果
		 * Create By YMJ At 2013-01-14
		 */
        toggleInt: function (value, duration) {
            var element;
            if (isNaN(value = parseInt(value))) return this;
            duration = parseInt(duration) || 1000;
            //最短时间为100毫秒
            duration = duration < 100 ? 100 : duration;
            for (var i = 0, l = this.length; i < l; i++) {
                element = this[i];
                if (isNaN(parseInt(element.innerHTML))) continue;
                doAnimation(element, value, duration);
            }
            return this;
            /**
			 * 开始动画
			 */
            function doAnimation(ele, val, duration) {
                //计算循环次数
                var origin = parseInt(element.innerHTML), dvalue, loop, one, time, interval, doTime = 0;
                time = 20;
                dvalue = val - origin;
                dvalue = dvalue < 0 ? -dvalue : dvalue;
                one = dvalue / duration * time;
                one = one < 1 ? 1 : Math.floor(one);
                if (one == 1) {
                    time = Math.floor(duration / dvalue);
                }
                //循环次数
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
		 * 格式化textarea内容并返回
		 * 1、每一行用<p>包含
		 * 2、每一行的头部的空格数设置标签<p>的text-indent样式，单位自定，默认em
		 * 3、每一行的其他部分出现空格，用&nbsp;替代
		 * 4、过滤script标签
		 * 5、过滤HTML标签（可选，默认过滤）
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
            //为空时
            if (val.length == 1 && val[0] == "") return "";
            //单位
            temp = opts.headSpace.match(/^([\d\.]*)([a-zA-Z]*)$/);
            for (var i = 0; i < val.length; i++) {
                //计算前置空格数量
                pre = val[i].replace(/^(\s*)[\w\W]*$/, '$1').match(/\s/g);
                prelen = (pre ? pre.length : 0);
                val[i] = val[i].replace(/^\s*([\w\W]*)$/, '$1').replace(/\s/g, opts.OtherSpace);
                //除去SCRIPT标签
                val[i].replace(/<script([^>]*)>([^<]*)<\/script>/g, '&lt;script$1&gt;$2&lt;/script&gt;');
                //根据需要除去其他html标签
                if (!opts.htmlTag) {
                    val[i] = val[i].replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    //					val[i] = val[i].replace(/<([^>\s]*)([^>]*)>([^<]*)<\/\1?>/g, '&lt;$1$2&gt;$3&lt;/$1&gt;');
                }
                //组装
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
		 * 绑定文本输入框input和textarea改变时事件
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

    // 禁止IE下缓存ajax请求
    //$.ajaxSetup({cache:false});
})(window, window.jQuery);