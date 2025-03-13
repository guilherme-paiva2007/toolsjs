"use strict";

var _react = _interopRequireDefault(require("react"));
var _server = _interopRequireDefault(require("react-dom/server"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function TestComponent(_ref) {
  var text = _ref.text,
    fontSize = _ref.fontSize;
  return /*#__PURE__*/_react["default"].createElement("p", {
    style: {
      fontSize: fontSize + "px"
    }
  }, text);
}
console.log(_server["default"].renderToString(/*#__PURE__*/_react["default"].createElement(TestComponent, {
  text: "Eu amo roblox",
  fontSize: 18
})));
