# Conjunto de Ferramentas Gerais

## Sobre

## Diretório

### `compile.js`

Sistema capaz de transpor módulos CommonJS para ESnext e compilá-los em um único script para utilização em navegadores.

Pode receber parâmetros opicionais na sua execução:

```
node compile.js webmodules=WEB_MODULES_DESTINATION webraw=WEB_SCRIPTS_DESTINATION nodeorigin=COMMONJS_SCRIPTS_SOUCE
```