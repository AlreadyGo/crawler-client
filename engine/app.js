import Executor from './executor';
import WebPage from './webpage';
require('file-loader?name=index.html!./index.html');

$toggleCrawlerLog();

window.runConfig = (config, args = {}, order = 0) => {
  if (args.debug === undefined) args.debug = false;
  return Executor.run($views[order], config, args);
};
window.resetWebpage = ( orders = 1) => {
  if (window.$views && window.$views.length>0) $views.forEach($view=>{$view.dispose();});
  window.$views = [];
  for(var i=0;i<orders;i++){
      $views.push(new WebPage(`${Math.random()}`))
  }
  // $view.requestUrl("https://www.taobao.com/");
};

window.showDevTool = ( order = 1 ) => $views[order].webview.openDevTools();

window.load = (url, order = 1) => $views[order].requestUrl(url);

$(() => {
  console.log("####################################");
  console.log("Welcome to the unicrawler playground.");
  console.log("Use `load(url)` to open url in the target webview if you need to login before running a config.");
  console.log("Use `showDevTool()` to open the dev tool of the target webview.");
  console.log("Use `runConfig(config, args)` to test.");
  console.log("Use `resetWebpage()` to reset this tool, cache and cookies will deleted.");
  console.log("####################################");
  resetWebpage();
});
