import Executor from "./executor";
import WebPage from "./webpage";
import WebPagePool from "./webPagePool";

require('file-loader?name=index.html!./index.html');

window.WebPagePool = WebPagePool;

window.runConfig = (config, args = {}, order = 0) => {
    if (args.debug === undefined) args.debug = false;
    return Executor.run($views[order], config, args);
};
window.resetWebpage = (numbers = 1) => {
    if (window.$views && window.$views.length > 0) {
        $views.forEach($view => {
            $view.dispose();
        });
    }

    window.$views = (new Array(numbers)).fill(0).map((v, i) => (new WebPage(i)));
    if (numbers === 1) {
        $(window.$views[0].webview).addClass('webview');
    }
    window.$views.forEach($view => {
        $view.requestUrl("https://www.taobao.com/");
    })
};

window.showDevTool = (order = 0) => $views[order].webview.openDevTools();

window.showDevToolByPartition = (partition) => {
    $(`webview[partition="${partition}"]`)[0].openDevTools()
}
window.load = (url, order = 0) => $views[order].requestUrl(url);

$(() => {
    console.log("####################################");
    console.log("Welcome to the crawler playground.");
    console.log("Use `load(url)` to open url in the target webview if you need to login before running a config.");
    console.log("Use `showDevTool()` to open the dev tool of the target webview.");
    console.log("Use `runConfig(config, args)` to test.");
    console.log("Use `resetWebpage()` to reset this tool, cache and cookies will deleted.");
    console.log("####################################");
    resetWebpage();
});
