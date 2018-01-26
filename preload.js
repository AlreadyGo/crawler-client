window.$ipc = require("electron").ipcRenderer;
window.$Promise = Promise;
window.onload=()=> {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//cdn.bootcss.com/jquery/2.1.4/jquery.min.js";
    document.body.appendChild(script);
}
