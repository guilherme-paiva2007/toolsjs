import React from "react";
import ReactDOMServer from "react-dom/server";

function TestComponent({ text, fontSize }) {
    return (<p style={{
        fontSize: fontSize + "px"
    }}>
        {text}
    </p>)
}

console.log(ReactDOMServer.renderToString(<TestComponent text="Eu amo roblox" fontSize={18} />));