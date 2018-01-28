[
    {
        type: "request",
        url: function(args) {
            return "https://mq.sycm.taobao.com/words/search_words.htm?spm=a21ag.7782691.0.0.qySbhJ&_res_id_=254#/";
        }
    }, {
    type: "waitFor",
    selector: ".shop-title"
}, {
    selector: '.shop-title',
    extract: 'text',
    name: 'shop'
}, {
    type: 'script',
    func: function(args) {
        var result = {};
        new Promise(function(f) {
            if (window.jQuery) return f(0);
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.onload = f;
            script.src = "//cdn.bootcss.com/jquery/2.1.4/jquery.min.js";
            document.body.appendChild(script);
        }).then(function() {
                var md = $('meta[name="microdata"]').attr('content');
                window.$md = {};
                $(md.split(';')).each(function(i, data) {
                    if (data == '') return;
                    var kv = data.split('=');
                    $md[kv[0]] = kv[1];
                });
                return Promise.all([0,1, 2].map(function(device) {
                    var pad = function(str, max) {
                        str = str.toString();
                        return str.length < max ? pad("0" + str, max) : str;
                    };
                    var toDateStr = function(date) {
                        return date.getFullYear() + '-' + pad(1 + date.getMonth(), 2) + '-' + pad(date.getDate(), 2);
                    };
                    var beginDate=toDateStr(new Date(Date.now()-7*86400000)),
                        endDate=toDateStr(new Date(Date.now()-1*86400000));
                    return fetch(
                        'https://mq.sycm.taobao.com/searchword/relatedWord.json?dateRange='+beginDate+'|'+endDate+'&dateType=recent7&device='+device+'&keyword='+args.keyword+'&sycmToken=' + $md.token + '&_=' + (new Date().getTime())
                        , {
                            credentials: 'include'
                        }
                    ).then(function(v) { return v.json(); }).then(function(v) {
                            result[['all','pc', 'wl'][device]] = v.content.data;
                        });
                }));
            }).then(function() {
                window.$result = result;
                console.info(result);
            });
    }
}, {
    type: 'waitFor',
    tries: 20,
    selector: function() { return !!window.$result; }
}, {
    type: 'script',
    func: function(args, result) {
        result.all=window.$result.all;
        result.wl = window.$result.wl;
        result.pc = window.$result.pc;
    }
}
]