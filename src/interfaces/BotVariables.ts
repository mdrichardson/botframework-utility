export interface BotVariables {
    MicrosoftAppId: string;
    MicrosoftAppPassword: string;
    ResourceGroupName: string;
    Location: string;
    CodeLanguage: string;
    BotName: string;
    ServicePlanName: string;
    [EndpointKeys: string]: string | undefined;
}