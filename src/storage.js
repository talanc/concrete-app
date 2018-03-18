import * as conf from './conf';

export function getConfiguration(configurationId) {
    const configuration = conf.generateDefaultConfiguration();
    configuration.name = configurationId;
    return configuration;
}

export function saveConfiguration(configuration, secret) {
    // TODO
}

export function guessConfigurationSecret(configurationId, secret) {
    return false;
}