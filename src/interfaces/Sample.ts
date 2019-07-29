// Be sure to update if this ever changes (unlikely)
//  Can't use constants because computed enums aren't allowed

export type SampleLanguage = 
    'csharp_dotnetcore' |
    'csharp_webapi' |
    'javascript_es6' |
    'javascript_nodejs' |
    'typescript_nodejs';

export class Sample {
    public language: SampleLanguage;
    public name: string;
    public readonly path;

    public constructor(language: SampleLanguage, name: string) {
        this.language = language;
        this.name = name;
        this.path = `${ this.language }/${ this.name }`;
    }
}