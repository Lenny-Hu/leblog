var config = require('config');
var appConfig = config.get('customer');
console.log('当前使用的配置', appConfig);

module.exports = appConfig;
