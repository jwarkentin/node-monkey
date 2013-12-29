module.exports = {
  // See: http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex#answer-6969486
  regexpEscape: function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },

  parseCookies: function(cookies) {
    cookies = cookies.toString();
    var matchPairs = new RegExp('([^=]+?)=(.*?)(?:;|$)', 'g'),
        pair = null;

    var pairs = {};
    while(pair = matchPairs.exec(cookies)) {
      pairs[pair[1].trim()] = pair[2].trim();
    }

    return pairs;
  }
};