## 本地测试需要安装totoro-server

```
sudo npm install totoro-server -g
totoro-server --server-host 127.0.0.1
```

grunt会默认启动totoro-server，然后每次文件改变会

```
totoro --server-host 127.0.0.1
```


## 代码push到远端需要过所有浏览器

默认使用内网的totoro的测试服务，它包含了所有的浏览器, 直接在项目根目录

```
totoro
```
