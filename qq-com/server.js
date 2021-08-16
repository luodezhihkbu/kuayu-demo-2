var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.argv[2];

if (!port) {
  console.log("请指定端口号好不啦？\nnode server.js 8888 这样不会吗？");
  process.exit(1);
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  var path = parsedUrl.pathname;
  var query = parsedUrl.query;
  var method = request.method;

  /******** 从这里开始看，上面不要看 ************/

  console.log("有个傻子发请求过来啦！路径（带查询参数）为：" + pathWithQuery);

  if (path === "/index.html") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    response.write(fs.readFileSync("./public/index.html"));
    response.end();
  } else if (path === "/qq.js") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/javascript;charset=utf-8");
    response.write(fs.readFileSync("./public/qq.js"));
    response.end();
  } else if (path === "/friends.json") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/json;charset=utf-8");
    response.setHeader("Access-Control-Allow-Origin", "http://localhost:9999"); // 用 CORS 的方式来跨域
    response.write(fs.readFileSync("./public/friends.json"));
    response.end();
  } else if (path === "/friends.js") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/javascript;charset=utf-8");
    // 用 jsonp 的方式来跨域
    const string = fs.readFileSync("./public/friends.js").toString();
    const data = fs.readFileSync("./public/friends.json").toString();
    // 把 friends.js 中的数据占位符 {{data}} 用 data（即 friends.json 中的数据）替换；
    // 回调函数名字的占位符 {{callbackName}} 用请求链接中的查询字符串里的 callback 对应的值（即随机生成的数字）替换
    const string2 = string.replace("{{data}}", data).replace("{{callbackName}}", query.callback);
    response.write(string2);
    response.end();
  } else {
    response.statusCode = 404;
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    response.write(`你输入的路径不存在对应的内容`);
    response.end();
  }

  /******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log(
  "监听 " +
    port +
    " 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:" +
    port
);
