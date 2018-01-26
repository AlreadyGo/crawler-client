[
    {
        type: "request",
        url: function (args) {
            return "https://zxfx.sycm.taobao.com/";
        }
    }, {
    type: "waitFor",
    selector: "#main"
}, {
    type: 'script',
    func: function (args) {
        var fetchJSON = function(url, retries) {
            if (retries === undefined) retries = 10;
            return fetch(url, { credentials: 'include' }).then(function(v) { return v.json(); }).then(function(rs) {
                // if (rs.content && rs.content.code === 1008 && retries > 0) return fetchJSON(url, retries - 1);
                if (rs.hasError || rs.content.code !== 0) throw JSON.stringify(rs.content);
                return Promise.resolve(rs.content.data);
            }).catch(function(e) {
                result.errors.push("Fail to fetch `" + url + "`, message: " + e.toString());
                if (retries > 0) return new Promise(f => setTimeout(f, 3000)).then(() => fetchJSON(url, retries - 1));
                return Promise.reject(e);
            });
        };
        var pad = function(str, max) {
            str = str.toString();
            return str.length < max ? pad("0" + str, max) : str;
        };
        var toDateStr = function(date) {
            return date.getFullYear() + '-' + pad(1 + date.getMonth(), 2) + '-' + pad(date.getDate(), 2);
        };
        var startDate=toDateStr(new Date(Date.now()-args.day*86400000)),
            endDate=toDateStr(new Date(Date.now()-1*86400000))
        var result = { errors: [] };
        new Promise(function(f) {
            if (window.jQuery && window.$) return f(0);
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
                var procs = [];
                // pc
                procs.push(
                    fetchJSON('https://bda.sycm.taobao.com/decorate/getCustomPageList.json?ctoken=null&t=' + Date.now() + '&_=' + Date.now()).then(function(data) {
                        result.pcPageList = data.list;
                        result.pcHome = { name: '首页', type: 1, objId: $md.shopId, url: 'http://shop' + $md.shopId + '.taobao.com' ,spmb:'shop/index_'+$md.userId+'_'+$md.shopId};
                        var list=[].concat(result.pcPageList);
                        list.unshift(result.pcHome);
                        var innerProcs=[];
                        list.forEach(function(item) {
                            item.data = [];
                            innerProcs.push(fetchJSON('https://bda.sycm.taobao.com/decorate/getGeneralTrend.json?_t='+Date.now()+'&appType=undefined&ctoken=null&dateRange='+startDate
                                +'%7C'+endDate+'&dateType=recent30&endDate='+endDate+'&objId='+item.objId+'&objId2='+item.objId+'&spmb='
                                +(item.objId==$md.shopId?'shop/index_'+$md.userId+'_'+$md.shopId:'shop/activity_'
                                +$md.userId+'_'+item.objId)+'&startDate='+startDate+'&type='+(item.objId === $md.shopId ? 0 : 1)+'&_='+ Date.now())
                                .then(function(v){v.list.forEach(function(data){item.data.push(data);});}));
                        });
                       return Promise.all(innerProcs);
                    })
                );


                //wl
                procs.push(
                    fetchJSON('https://zxfx.sycm.taobao.com/decorate/getCustomPageList.json?ctoken=null&t=' + Date.now() + '&_=' + Date.now()).then(function(data) {
                        result.wlPageList = data.list;
                        result.wlHome=data.homepage;
                        var list = [].concat(result.wlPageList).concat(result.wlHome);
                        var innerProcs=[];
                        ['TB_APP','TM_APP'].map(function(appType) {
                            list.forEach(function (item) {
                                item.tm = [];
                                item.tb = [];
                                var type = 0;
                                if (item.pageType == 'shop/activity') type = 1;
                                if (item.pageType == 'shop/campaign') type = 3;
                                innerProcs.push(fetchJSON('https://zxfx.sycm.taobao.com/decorate/getGeneralTrend.json?_t=' + Date.now() + '&appType=' + appType + '&ctoken=null&dateRange=' + startDate
                                    + '%7C' + endDate + '&dateType=recent30&endDate=' + endDate + '&objId=' + item.objId + '&objId2=' + item.objId + '&spmb='
                                    + (item.pageType.indexOf('index') != -1 ? 'shop/index_' + $md.userId + '_' + item.objId : 'shop/activity_'
                                    + $md.userId + '_' + item.objId) + '&startDate=' + startDate + '&type=' + type + '&_=' + Date.now())
                                    .then(function (v) {
                                        if(appType=='TB_APP') v.list.forEach(function(data){item.tb.push(data);});
                                        if(appType=='TM_APP') v.list.forEach(function(data){item.tm.push(data);});

                                    }));
                            });
                        });
                        return Promise.all(innerProcs);
                    })
                );

                return Promise.all(procs);
            }).catch(function(e) {
                result.error = e.toString();
            }).then(function() {
                window.$result = result;
                console.log(JSON.parse(JSON.stringify(result)));
            });
    }
}, {
    type: 'waitFor',
    tries: 60,
    selector: function () {
        return !!window.$result;
    }
}, {
    type: 'script',
    func: function (args, result) {
        result.data = window.$result;
        if (window.$result.errors.length > 0) result.errors = window.$result.errors;
        delete result.data.errors;
    }
}
]