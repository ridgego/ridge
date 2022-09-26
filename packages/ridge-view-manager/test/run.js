var template = require('es6-template-strings');

// eslint-disable-next-line no-template-curly-in-string
console.log(template("${color === '#223'}", {
    color: '#344'
}));

// eslint-disable-next-line no-template-curly-in-string
console.log(template("${color === '#344'}", {
    color: '#344'
}));
