var language = require('./language');

var lang = 'Swift';

for (var i = 0; i < language.all.length; i++) {
    if (lang === language.all[i].name) {
        console.log(language.all[i]);
        break;
    }
}