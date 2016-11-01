// :: models :: //
require('./models/{Name}');

// :: routes :: //
exports.init = function (hawk) {
    hawk.invoke(require('./routes/{names}'));
};
