// 用 AJAX 访问另一个域中的 json 数据，由于同源策略，访问失败
const request = new XMLHttpRequest();
request.open("GET", "http://localhost:8888/friends.json");
request.onreadystatechange = () => {
  if (request.readyState === 4 && request.status === 200) {
    console.log(request.response);
  }
};
request.send();

/* 用 jsonp 的方式来跨域的原理：
 * 1. 在某个域下创建一个回调函数用来之后获取数据，同时创建一个 script 标签。
 * 2. 在 script 标签中设置请求链接来访问另一个域下的 js 文件，js 文件里写的是对前述回调函数的调用，函数名之后会被替换。
 *    请求链接里有个名为 callback 的查询字符串，它对应的值是个随机数，作为之后被替换的回调函数名。
 * 3. 另一个域的后端收到请求后，获取请求链接里 callback 查询字符串对应的值，将 js 文件里回调函数的名字替换为该值。
 *    并将 json 文件的数据作为 js 文件里回调函数的参数传递过去。
 * 4. 后端将 js 文件中的回调函数以字符串的形式返回给前述的那个域。
 * 5. 该域收到返回内容后，在 script 标签里解析，此时就会调用前述的回调函数，然后获取到函数参数里的 json 数据。
 */

// 声明一个随机生成的数字，挂载在 window 下，作为回调函数的名字
const random = Math.random();
window[random] = (data) => {
  console.log(data);
};
const script = document.createElement("script");
script.src = `http://localhost:8888/friends.js?callback=${random}`;
document.body.appendChild(script);
script.onload = () => {
  script.remove();
};

/***** 封装 jsonp *****/

function jsonp(url, param, callback) {
  let query = url.indexOf("?") === -1 ? "?" : "";
  for (let key in param) {
    if (param.hasOwnProperty(key)) {
      query += `${key}=${param[key]}&`;
    }
  }
  let callbackName = Math.random();
  let script = document.createElement("script");
  script.src = `${url}${query}callback=${callbackName}`;
  window[callbackName] = function (data) {
    callback(data);
    document.body.removeChild(script);
    delete window[callbackName];
  };
  document.body.appendChild(script);
}
// 使用 jsonp
jsonp("http://localhost:8888/friends.js", { a: 1, b: 2 }, function (data) {
  console.log(data);
});
