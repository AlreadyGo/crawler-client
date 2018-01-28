## Instructions

### docs
[docs](https://alreadygo.github.io/2018/01/28/electron%E5%AE%9E%E7%8E%B0%E7%AE%80%E5%8D%95%E7%9A%84%E7%88%AC%E8%99%AB%E5%AE%A2%E6%88%B7%E7%AB%AF/)

### To run this devtools:

``` bash
npm install -g electron-prebuilt
cd $PROJECT_DIR/engine
npm install
npm run dist
cd $PROJECT_DIR
electron .
```

### To pack this client:

```
 cd $PROJECT_DIR
 electron-packager .
```