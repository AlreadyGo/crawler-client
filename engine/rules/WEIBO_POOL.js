var config = [{
    type: "waitFor",
    selector: "body .WB_miniblog .PCD_followlist",
    timeout: 30
}, {
    type: 'script',
    async: true,
    timeout: 60,
    func: function(args, target, callback) {
        new Promise(function(f) {
            if (window.jQuery && window.$) return f(0);
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.onload = f;
            script.src = "//cdn.bootcss.com/jquery/2.1.4/jquery.min.js";
            document.body.appendChild(script);
        }).then(() => {
            var html = $('body .WB_miniblog');

            function transform(t) {
                var r = [];
                t.find('dd.mod_info').each((i, v) => {
                    var o = {},
                        $t = $(v);
                    o.name = $t.find('.info_name a strong').text();
                    o.url = $t.find('.info_name a').attr('href');
                    o.connect = $t.find('.info_connect span:eq(0) .count').text();
                    o.fans = $t.find('.info_connect span:eq(1) .count').text();
                    o.weibo = $t.find('.info_connect span:eq(2) .count').text();
                    o.address = $t.find('.info_add span').text();
                    o.intro = $t.find('.info_intro span').text();
                    r.push(o)
                });
                return r;
            }
            target.data = transform(html);
            target.cat = args.cat;
            callback();
        });

    }
}

]

let pool = new WebPagePool(5);

let callback = data => {
    if (!result[data.cat])result[data.cat]=[];
    result[data.cat].push(...data.data);
}

let result={};

let cats = [{"url":"https://d.weibo.com/1087030002_2975_7002_0","cat":"政府官员","total":103},{"url":"https://d.weibo.com/1087030002_2975_7005_0","cat":"时评","total":35},{"url":"https://d.weibo.com/1087030002_2975_2025_0","cat":"时尚","total":155},{"url":"https://d.weibo.com/1087030002_2975_2012_0","cat":"电影","total":138},{"url":"https://d.weibo.com/1087030002_2975_2006_0","cat":"美女","total":118},{"url":"https://d.weibo.com/1087030002_2975_2021_0","cat":"电视剧","total":49},{"url":"https://d.weibo.com/1087030002_2975_2011_0","cat":"音乐","total":181},{"url":"https://d.weibo.com/1087030002_2975_6001_0","cat":"综艺","total":183},{"url":"https://d.weibo.com/1087030002_2975_2001_0","cat":"动漫","total":139},{"url":"https://d.weibo.com/1087030002_2975_2019_0","cat":"游戏","total":99},{"url":"https://d.weibo.com/1087030002_2975_2010_0","cat":"星座","total":46},{"url":"https://d.weibo.com/1087030002_2975_2004_0","cat":"搞笑","total":169},{"url":"https://d.weibo.com/1087030002_2975_2007_0","cat":"情感两性","total":177},{"url":"https://d.weibo.com/1087030002_2975_2020_0","cat":"运动健身","total":125},{"url":"https://d.weibo.com/1087030002_2975_1002_0","cat":"体育","total":100},{"url":"https://d.weibo.com/1087030002_2975_2002_0","cat":"萌宠","total":77},{"url":"https://d.weibo.com/1087030002_2975_5003_0","cat":"旅游","total":118},{"url":"https://d.weibo.com/1087030002_2975_2023_0","cat":"美食","total":155},{"url":"https://d.weibo.com/1087030002_2975_2015_0","cat":"摄影","total":175},{"url":"https://d.weibo.com/1087030002_2975_6005_0","cat":"历史","total":24},{"url":"https://d.weibo.com/1087030002_2975_5009_0","cat":"科学","total":33},{"url":"https://d.weibo.com/1087030002_2975_2026_0","cat":"军事","total":43},{"url":"https://d.weibo.com/1087030002_2975_2009_0","cat":"数码","total":89},{"url":"https://d.weibo.com/1087030002_2975_8002_0","cat":"收藏","total":21},{"url":"https://d.weibo.com/1087030002_2975_2017_0","cat":"医疗","total":171},{"url":"https://d.weibo.com/1087030002_2975_9002_0","cat":"直播","total":197},{"url":"https://d.weibo.com/1087030002_2975_8001_0","cat":"养生","total":15},{"url":"https://d.weibo.com/1087030002_2975_5002_0","cat":"IT互联网","total":65},{"url":"https://d.weibo.com/1087030002_2975_2018_0","cat":"育儿","total":140},{"url":"https://d.weibo.com/1087030002_2975_8003_0","cat":"电商","total":155},{"url":"https://d.weibo.com/1087030002_2975_5001_0","cat":"财经","total":70},{"url":"https://d.weibo.com/1087030002_2975_5012_0","cat":"电台","total":28},{"url":"https://d.weibo.com/1087030002_2975_2016_0","cat":"教育","total":133},{"url":"https://d.weibo.com/1087030002_2975_5013_0","cat":"法律","total":49},{"url":"https://d.weibo.com/1087030002_2975_2014_0","cat":"美妆","total":164},{"url":"https://d.weibo.com/1087030002_2975_2024_0","cat":"艺术","total":115},{"url":"https://d.weibo.com/1087030002_2975_5015_0","cat":"设计","total":129},{"url":"https://d.weibo.com/1087030002_2975_5005_0","cat":"房产家装","total":37},{"url":"https://d.weibo.com/1087030002_2975_5006_0","cat":"汽车","total":69},{"url":"https://d.weibo.com/1087030002_2975_5008_0","cat":"交通","total":0},{"url":"https://d.weibo.com/1087030002_2975_5011_0","cat":"婚庆","total":77},{"url":"https://d.weibo.com/1087030002_2975_2013_0","cat":"职业招聘","total":41},{"url":"https://d.weibo.com/1087030002_2975_6004_0","cat":"公益","total":55},{"url":"https://d.weibo.com/1087030002_2975_5014_0","cat":"宗教","total":49},{"url":"https://d.weibo.com/1087030002_2975_1004_0","cat":"政务","total":189},{"url":"https://d.weibo.com/1087030002_2975_7001_0","cat":"媒体","total":137}];

cats.forEach((cat)=>{
    let len = cat.total;
    for(var i=1;i<len+1;i++){
        pool.submit(config,Object.assign({},cat,{url:`${cat.url}?page=${i}`}),callback)
    }
})
