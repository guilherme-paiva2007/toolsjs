# Documentação

Recursos disponíveis em `src/`

## Base

## Namespace
<code class=keyword>namespace <span class=namespace>Namespace</span></code>
<code><span class=keyword>function</span> <span class=function>Namespace</span>(<span class=parameter>object</span>: <span class=type>object</span>, <span class=parameter>name</span>: <span class=type>string</span>): <span class=type>object</span></code>

Define um objeto como uma área de trabalho para funcionalidades específicas.

### Verificando um Namespace
<code><span class=keyword>method </span><span class=namespace>Namespace</span>.<span class=function>isNamespace</span>(<span class=parameter>object</span>: <span class=type>object</span>): <span class=type>boolean</span></code>

Retorna `true` se o objeto foi previamente definido como um `Namespace`.
> Quando um objeto é transformado em Namespace, uma propriedade secreta com símbolo é definido no mesmo, permitindo sua identificação.

## Node

### Web Server Manager
<code><span class=keyword>class</span> <span class=class>ServerManager</span></code>

<style>
    .keyword {
        color: violet
    }
    .function {
        color: deepskyblue;
    }
    .class {
        color: yellow
    }
    .namespace {
        color: gold
    }
    .parameter {
        color: mediumseagreen
    }
    .type {
        color: cornflowerblue
    }
</style>