require("./compile.js")({
    webmodules: "./assets/src/",
    webraw: "./assets/scripts.js"
});

const emptystr = require("./src/base/string_empty.js");
const validstr = require("./src/base/string_valid.js");

const Namespace = require("./src/namespace.js");
const Property = require("./src/property.js");

const LinkedList = require("./src/collections/linkedlist.js");
const Stack = require("./src/collections/stack.js");
const Queue = require("./src/collections/queue.js");
const Typed = require("./src/collections/typed.js");
const TypedMap = require("./src/collections/typedmap.js");
const TypedSet = require("./src/collections/typedset.js");
const TypedStack = require("./src/collections/typedstack.js");
const TypedArray = require("./src/collections/typedarray.js");

const ContextError = require("./src/errors/contexterror.js");
const ExpressionError = require("./src/errors/expressionerror.js");
const InterfaceError = require("./src/errors/interfaceerror.js");
const LogicalError = require("./src/errors/logicalerror.js");
const OptionError = require("./src/errors/optionerror.js");

const Cookie = require("./src/util/cookie.js");
const ID = require("./src/util/id.js");
const Color = require("./src/util/color.js");
const ConsoleStyle = require("./src/util/consolestyle.js");
const Time = require("./src/util/time.js");

const Page = require("./src/node/page.js");
const Session = require("./src/node/session.js");
const ServerManager = require("./src/node/server.js");

const Compatibility = require("./src/client/compatibility.js");

module.exports = {
    emptystr,
    validstr,
    Namespace,
    Property,
    LinkedList,
    Stack,
    Queue,
    Typed,
    TypedMap,
    TypedSet,
    TypedStack,
    TypedArray,
    ContextError,
    ExpressionError,
    InterfaceError,
    LogicalError,
    OptionError,
    Cookie,
    ID,
    Color,
    ConsoleStyle,
    Time,
    Page,
    Session,
    ServerManager,
    Compatibility
}