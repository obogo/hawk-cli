// :: models :: //
require('./models/{Name}');

// :: routes :: //
exports.init = function (hawk, passport) {
    hawk.invoke(require('./routes/{names}'));
};
