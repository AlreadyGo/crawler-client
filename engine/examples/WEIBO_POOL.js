let config = [{
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
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.onload = f;
            script.src = "//cdn.bootcss.com/jquery/2.1.4/jquery.min.js";
            document.body.appendChild(script);
        }).then(() => {
            let html = $('body .WB_miniblog');

            function transform(t) {
                let r = [];
                t.find('dd.mod_info').each((i, v) => {
                    let o = {},
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

let pool = new WebPagePool(10);

let callback = data => {
    if (!result[data.cat])result[data.cat]=[];
    result[data.cat].push(...data.data);
}

let result={};

let cats =
    [{"url":"https://d.weibo.com/1087030002_2975_1003_0","cat":"明星","total":100}];

cats.forEach((cat)=>{
    let len = cat.total;
    for(let i=1;i<len+1;i++){
        pool.submit(config,Object.assign({},cat,{url:`${cat.url}?page=${i}`}),callback)
    }
})
