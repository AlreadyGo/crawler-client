import EventEmitter from 'events';
const fs = $require("fs");

const UserAgent = "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36";
const appPath = $require('electron').remote.app.getAppPath();
const preloadScript = `file:///${appPath}/preload.js`;

var WebPageBase = function() {};
Object.assign(WebPageBase.prototype, EventEmitter.prototype, {
  waitFor: function(selector, timeout, cb, params = []) {
    var page = this;
    var i, pass;
    if (arguments.length === 2 && typeof timeout === 'function') {
      cb = timeout;
      timeout = 10;
    }
    if (typeof cb !== 'function') {
      return;
    }
    if (timeout < 0 || isNaN(timeout)) {
      timeout = 10;
    }
    timeout *= 10;
    pass = function() {
      return page.evaluate(function(conf) {
        if (conf.type === 'function') {
          return eval("(" + conf.selector + ")").apply(window, conf.params);
        }
        return window.jQuery && jQuery(conf.selector) && jQuery(conf.selector).length > 0;
      }, {
        selector: selector.toString(),
        type: typeof(selector),
        params
      });
    };
    const check = (countdown) => {
      if (countdown <= 0) return cb(false);
      pass().then(rs => {
        if (rs) {
          cb(true);
        } else throw 'retry';
      }).catch(e => {
        setTimeout(() => {
          check(countdown - 1);
        }, 100);
      });
    };
    check(timeout);
  },
  requestUrl: function(url, data, callback) {
    if (typeof(callback) === 'function') {
      let timer = setTimeout(cb, 10000);
      let cb = () => {
        clearTimeout(timer);
        this.removeListener('load', cb);
        callback();
      }
      this.once('load', cb);
    }
    this.navigate(url, data);
  }
});

const WebView = function(partition = "inmemsession") {
  this.webview = $(`<webview preload="${preloadScript}" 
                    style="flex: 0 1; width: 0px; height: 0px;" 
                    useragent="${UserAgent}" autosize partition=${JSON.stringify(partition)} ></webview>`);
  this.webview.appendTo('body');
  this.webview = this.webview[0];
  this.webview.addEventListener('did-finish-load', () => {
    this.emit('load');
  });
  this.webview.addEventListener('did-fail-load', (e) => {
    console.log(`Webview load failed ${e}`);
    this.emit('load');
  });
};

Object.assign(WebView.prototype, WebPageBase.prototype, {
  dispose() {
    $(this.webview).remove();
    delete this.webview;
  },
  initSizzle() {
    return Promise.resolve(0);
  },
  evaluate(fn, args) {
    const wv = this.webview;
    return new Promise((f, r) => {
      let channel = `[${Math.random()}]`;
      let timer = setTimeout(function() {
        wv.removeEventListener('ipc-message', cb);
        r("Fail to execute javascript: " + script);
      }, 1000);
      const cb = (e) => {
        try {
          if (e.channel.indexOf(channel) != 0) return;
          clearTimeout(timer);
          wv.removeEventListener('ipc-message', cb);
          let result = e.channel.substr(channel.length);
          if (result.indexOf("ERROR:") === 0) r(result.substr(6));
          else f(JSON.parse(result));
        } catch(e) { console.error(e); }
      };
      wv.addEventListener('ipc-message', cb);
      let script = `window.jQuery = window.jQuery || function(s) { document.querySelectorAll(s); };
          window._Promise = window._Promise || window.Promise;
          var result = (${fn.toString()})(${JSON.stringify(args)});
          try { $ipc.sendToHost("${channel}" + JSON.stringify(result || null)); }
          catch(e) { $ipc.sendToHost("${channel}ERROR:" + e.toString()); }`;
      wv.executeJavaScript(script);
    });
  },
  navigate(url, data) {
    this.webview.src = url;
  },
  getUrl() {
    return this.webview.getURL();
  },
  show(title = "默认弹出框标题") {
    console.log(`Dialog showed with title: ${title}`);
  }
});

export default WebView;
