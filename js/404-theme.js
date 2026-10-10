/* 404.html only: use the light/dark choice the visitor made on the portfolio (js/main.js saves it as "ms-theme").
   Runs in <head> before the page is drawn, so there is no flash. Without a saved choice the page follows the device setting. */
(function () {
  try {
    var t = localStorage.getItem('ms-theme');
    if (t !== 'light' && t !== 'dark') return;
    document.documentElement.setAttribute('data-theme', t);
    var m = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < m.length; i++) m[i].setAttribute('content', t === 'dark' ? '#0a0b11' : '#f6f5f1');
  } catch (e) {}
})();
