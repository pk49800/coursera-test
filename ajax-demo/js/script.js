// Event handling
document.addEventListener("DOMContentLoaded", function (event) {
  // Unobstrusive envet binding
  document.querySelector("button").addEventListener("click", function () {
    $ajaxUtils.sendGetRequest(
      "/data/name.txt",
      function (request) {
        var name = request.responseText;
        document.querySelector("#content").innerHTML =
          "<h2>Hello " + name + "!</h2>";
      },
      false
    );
    $ajaxUtils.sendGetRequest("/data/data.json", function (res) {
      var data = res.name;
      data += " is a " + res.job;
      data += ", he was " + res.age;
      if (res.married) {
        data += " and he was married.";
      } else {
        data += " but he was not married.";
      }
      document.querySelector("#data").innerHTML = data;
    });
  });
});
