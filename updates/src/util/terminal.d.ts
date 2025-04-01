declare class Command {}

declare class Terminal {
    call(line, outputMethod: (result: any) => any): any

    createCaller(): TerminalCaller
}