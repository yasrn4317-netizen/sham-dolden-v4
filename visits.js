// visits.js — عداد الزيارات لصفحات المستخدم فقط
(function() {
  let visits = parseInt(localStorage.getItem("site_visits") || "0");
  visits += 1;
  localStorage.setItem("site_visits", visits);
})();
