// Coleções que podem ter regras de acesso, exigindo chaves temporárias ou senhas para autorizar a alteração.

declare class ProtectorRule {
    
}

declare class Protector<C = object> {
    constructor()

    addRule(rule: ProtectorRule): void
}