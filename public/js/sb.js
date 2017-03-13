"use strict";
!function () {
    if (!window.QIAO || !window.QIAO.widget) {
        var e = {
            host: "https://www.sosobtc.com",
            $: function (e) { return document.getElementById(e) },
            uid: function () { return "qiao_" + (1048576 * (1 + Math.random()) | 0).toString(16).substring(1) },
            onready: function (e) { window.addEventListener ? window.addEventListener("DOMContentLoaded", e, !1) : window.attachEvent("onload", e) },
            bindEvent: function (e, n, t) { e.addEventListener ? e.addEventListener(n, t, !1) : e.attachEvent && e.attachEvent("on" + n, t) },
            unbindEvent: function (e, n, t) { e.removeEventListener ? e.removeEventListener(n, t, !1) : e.detachEvent && e.detachEvent("on" + n, t) },
            clone: function (e) {
                if (null == e || "object" != typeof e) return e;
                var n = e.constructor();
                for (var t in e) e.hasOwnProperty(t) && (n[t] = e[t]);
                return n
            },
            isArray: function (e) { return "[object Array]" === Object.prototype.toString.call(e) },
            urlBuilderFunction: function (e) {
                for (var n = "", t = "", o = "", r = "", i = "", a = "", d = "", u = 0; u < e.length; u++)
                    if (e[u])
                        switch (e[u].name) {
                            case "website":
                                n = e[u].value;
                                break;
                            case "utm_source":
                                t = encodeURIComponent(e[u].value);
                                break;
                            case "utm_medium":
                                o = encodeURIComponent(e[u].value);
                                break;
                            case "utm_term":
                                r = encodeURIComponent(e[u].value);
                                break;
                            case "utm_content":
                                i = encodeURIComponent(e[u].value);
                                break;
                            case "utm_campaign":
                                a = encodeURIComponent(e[u].value)
                        }
                return n.indexOf("#") !== -1 && (d = n.substring(n.indexOf("#")), n = n.substring(0, n.indexOf("#"))), n
                    .indexOf("/", 9) ===
                    -1 &&
                    n.indexOf("?") === -1 &&
                    (n += "/"), n += n.indexOf("?") === -1 ? "?" : "&", n += "utm_source=" + t + "&utm_medium=" + o, "" != r && (n += "&utm_term=" + r), "" != i && (n += "&utm_content=" + i), n += "&utm_campaign=" + a, d && (n += d), n
            },
            widget: function (n) {
                this.id = e.uid();
                var t = n.symbol || "BTC:OKCOIN";
                this.options = { symbol: t, container: n.container, default_step: n.default_step, default_theme: n.default_theme, disable_theme_change: n.disable_theme_change, default_open_tools: n.default_open_tools, hide_logo: true }, this._ready_handlers = [], this.create()
            }
        };
        e.widget.prototype = {
            create: function () {
                var t, o = this.render(), r = this;
                n(o, this.options.container);
                t = e.$(this.id);
                e.bindEvent(t, "load", function () { r._ready = !0 })
            },
            ready: function (e) { this._ready ? e.call(this) : this._ready_handlers.push(e) },
            render: function () {
                var e = this.generateUrl();
                return '<iframe id="' + "zx" + '" src="' + e + '" frameborder="0" allowTransparency="true" scrolling="no" allowfullscreen style="width: 100%; height: 100%;"></iframe>'
            },
            generateUrl: function (n) {
                function t(e, t, o) { return o = o || e, n[e] ? "&" + o + "=" + t : "" }
                n = n || this.options;
                var o = "/widget/",
                    r = e.host,
                    i = e.urlBuilderFunction([
                        {
                            name: "website",
                            value: r + o + "?symbol=" + encodeURIComponent(n.symbol) + t("default_step", n.default_step) + t("default_theme", n.default_theme) + t("disable_theme_change", n.disable_theme_change) + t("default_open_tools", n.default_open_tools) + t("hide_logo", true)
                        }, { name: "utm_source", value: "xtjt.me" }, { name: "utm_medium", value: "xtjt.me" }, { name: "utm_campaign", value: "widget" }
                    ]);
                return i
            },
            remove: function () {
                var n = e.$(this.id);
                n.parentNode.removeChild(n)
            },
            reload: function () {
                var n = e.$(this.id), t = n.parentNode;
                t.removeChild(n), t.innerHTML = this.render()
            }
        }, e.getUrlParams = function () {
            for (var e = /\+/g, n = /([^&=]+)=?([^&]*)/g, t = window.location.search.substring(1), o = n.exec(t), r = function (n) { return decodeURIComponent(n.replace(e, " ")) }, i = {}; o;) i[r(o[1])] = r(o[2]), o = n.exec(t);
            return i
        }, e.createUrlParams = function (e) {
            var n = [];
            for (var t in e) e.hasOwnProperty(t) && null != e[t] && n.push(encodeURIComponent(t) + "=" + encodeURIComponent(e[t]));
            return n.join("&")
        };
        var n = function (n, t) {
            var o = e.$(t);
            o ? o.innerHTML = n : document.write(n)
        };
        window.QIAO && jQuery ? jQuery.extend(window.QIAO, e) : window.QIAO = e
    }
}();