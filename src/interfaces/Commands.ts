export interface Commands {
    [index: string]: () => void | Promise<void>;
}