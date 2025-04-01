export default async function component(name, parameters) {
    const headers = new Headers();

    headers.set("x-get-component", "true");
    headers.set("x-get-component-parameters", parameters ? JSON.stringify(parameters) : "{}");

    return await (await fetch(`/${name}`, {
        headers
    })).text();
}