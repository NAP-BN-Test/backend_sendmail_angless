
Bỏ "Z" trong node_modules theo đường dẫn "node_modules/sequelize/lib/data-types.js"

DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options);

  // Z here means current timezone, _not_ UTC
  // return date.format('YYYY-MM-DD HH:mm:ss.SSS');
  return date.format('YYYY-MM-DD HH:mm:ss.SSS');
};