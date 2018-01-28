## Instructions

To run this devtools:

``` bash
npm install -g electron-prebuilt
cd $PROJECT_DIR/engine
npm install
npm run dist
cd $PROJECT_DIR
electron .
```

To pack this client:

```
 cd $PROJECT_DIR
 electron-packager .
```