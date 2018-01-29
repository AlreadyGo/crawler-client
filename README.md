### 下载客户端
[下载win客户端/绿色免安装](https://github.com/AlreadyGo/crawler-client/releases)

### 解压客户端压缩包

### 双击crawler-devTools.exe
![crawler-devTools.png](/images/crawler/crawler-devTools.png)

### 在控制台执行代码
- $toggleCrawlerLog(): 打印log
- showDevTool(): 调出控制台
![console.png](/images/crawler/console.png)

### 爬取微博明星分类下前100页数据
[微博链接](https://d.weibo.com/1087030002_2975_1003_0#)
![微博列表页.png](/images/crawler/微博列表页.png)
在控制台执行以下代码:
```
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

let cats =
    [{"url":"https://d.weibo.com/1087030002_2975_1003_0","cat":"明星","total":100}];

cats.forEach((cat)=>{
    let len = cat.total;
    for(var i=1;i<len+1;i++){
        pool.submit(config,Object.assign({},cat,{url:`${cat.url}?page=${i}`}),callback)
    }
})
```

#### 代码说明
- 均使用jq(sizzle)选择器
- config: 对象数组, executor会按顺序执行爬取动作
- waitFor: 等待$('body .WB_miniblog .PCD_followlist')元素出现,超时时间30s
- script: 在页面上执行异步脚本, args(参数,执行任务中传入,其中{url}表示需要请求的链接), target(执行结果,最终会返回), callback(脚本执行完必须调用callback方法)
- 结果: 本例的结果均放入result变量中
![运行中的结果.png](/images/crawler/运行中的结果.png)
- WebPagePool: 页面池, 打开多个页面异步执行爬取任务
let pool = new WebPagePool(5); 创建一个有五个页面的页面池
![electron的webview.png](/images/crawler/electron的webview.png)
- WebPagePool常用方法
pool.submit(config,args,callback): config爬取配置,args爬取参数,callback回调方法(callback的参数就是script中的target)
pool.queue: 等待执行的任务
pool.failQueue: 失败的任务
pool.failBack(): 失败任务全部重试
pool.isOver(): 页面池的任务是否结束
pool.close(): 销毁页面池
![pool-methods.png](/images/crawler/pool-methods.png)

### 运行源码

``` bash
npm install -g electron-prebuilt
cd $PROJECT_DIR/engine
npm install
npm run dist
cd $PROJECT_DIR
electron .
```

### 打包客户端

```
 cd $PROJECT_DIR
 electron-packager .
```