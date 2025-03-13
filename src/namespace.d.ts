/**
 * Define um objeto como uma área de trabalho.
 * @param object 
 * @param name 
 */
function Namespace<OBJ>(object: OBJ, name: string): OBJ

namespace Namespace {
    /**
     * Verifica se um objeto é uma área de trabalho.
     * @param object 
     */
    function isNamespace(object: any): boolean

    /**
     * Lista de áreas de trabalho disponíveis.
     * 
     * @protected
     */
    const availableNamespaces: object
}

export = Namespace