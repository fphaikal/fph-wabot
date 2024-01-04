function formatTwoDigits(n) {
    return n < 10 ? '0' + n : n;
  }
  
  function formatLongDate(dateInput, isGetTime = false, includeSeconds = false) {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
    var dt = new Date(dateInput);
  
    if (isGetTime) {
      var time = formatTwoDigits(dt.getHours()) + ":" + formatTwoDigits(dt.getMinutes());
  
      if (includeSeconds) {
        time += ":" + formatTwoDigits(dt.getSeconds());
      }
  
      return time;
    } else {
      var longDate = dt.getDate() + " " + months[dt.getMonth()] + " " + dt.getFullYear() + " " + formatTwoDigits(dt.getHours()) + ":" + formatTwoDigits(dt.getMinutes());
  
      if (includeSeconds) {
        longDate += ":" + formatTwoDigits(dt.getSeconds());
      }
  
      return longDate;
    }
  }
  
  module.exports = formatLongDate;
1  