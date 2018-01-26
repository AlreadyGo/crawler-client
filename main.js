var electron = require('electron');
var app = electron.app;  // Module to control application life.
var BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
var Tray = electron.Tray;
var Menu = electron.Menu;
var ipc = electron.ipcMain;

app.setPath('appData', app.getAppPath() + "/cache");
app.setPath('userData', app.getAppPath() + "/cache/data");
app.setPath('temp', app.getAppPath() + "/cache/temp");

const ENDPOINT = `file:///${app.getAppPath()}/engine/build/index.html`;
var TOOLTIP = "Unicrawler - DevTools";

// Report crashes to our server.
electron.crashReporter.start({
    productName: 'YourName',
    companyName: 'YourCompany',
    submitURL: 'https://your-domain.com/url-to-submit',
    uploadToServer: false
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null, appIcon = null;

var reloadApp = function(url) {
  url = url || ENDPOINT;
  mainWindow.loadURL(url);
  setTimeout(function() { mainWindow.openDevTools(); }, 1000);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  appIcon = new Tray(app.getAppPath() + "/app.ico");
  var contextMenu = Menu.buildFromTemplate([
    {
      label: '主界面', click: function() {
        mainWindow.show();
      }
    },
    {
      label: '退出', click: function() {
        mainWindow.forceClose = true;
        app.quit();
      }
    }
  ]);
  appIcon.setToolTip(TOOLTIP);
  appIcon.setContextMenu(contextMenu);
  appIcon.on('double-click', function() {
    mainWindow.show();
  });
  appIcon.on('balloon-click', function() {
    mainWindow.show();
  });
  // Create the browser window.
  mainWindow = app.mainWindow = new BrowserWindow({ 
    width: 1280,
    height: 800,
    title: TOOLTIP,
    icon: app.getAppPath() + "/app.ico",
    "web-preferences": {
      "web-security": false,
      "allow-displaying-insecure-content": true,
      "allow-running-insecure-content": true
    }
  });
  // mainWindow.maximize();

  app.on('before-quit', () => {
    mainWindow.forceClose = true;
  });

  // Emitted when the window is closed.
  mainWindow.on('close', function(e) {
    if (mainWindow.forceClose) return;
    e.preventDefault();
    mainWindow.hide();
  });

  ipc.on('balloon-tip', function(e, msg) {
    appIcon.displayBalloon({ content: msg, title: TOOLTIP });
  });

  ipc.on('app-exit', function() {
    mainWindow.forceClose = true;
    mainWindow.close();
    app.quit();
  });

  ipc.on('app-reload', function(e, url) {
    reloadApp(url);
  });

  ipc.on('app-debug', function() {
    mainWindow.openDevTools();
  });

  reloadApp();

});
