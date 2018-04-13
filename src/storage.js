import base64url from 'base64url';
import msgpack from 'msgpack-lite';
import * as util from './util';

const encodeMap = {
  'isDefault': 'e',
  'name': 'n',
  'concreteRates': 'c',
  'key': 'k',
  'limit': 'l',
  'rate': 'r',
  'slabThickness125': 's',
  'meshThicknessSL82': 'm',
  'pumpOn': 'p',
  'pumpDouble': 'd',
  'polyMembraneOn': 'b',
  'rock': 'o',
  'taxRate': 't'
};

const decodeMap = reverseMap(encodeMap);

function renameKeys(obj, mapper) {
  let newObj = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newKey = mapper[key] || key;

    let newValue = value;
    if (value instanceof Array) {
      newValue = value.map(curr => renameKeys(curr, mapper));
    }
    else if (value instanceof Object) {
      newValue = renameKeys(value, mapper);
    }

    newObj[newKey] = newValue;
  });
  return newObj;
}

function reverseMap(obj) {
  let rev = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (rev[value]) {
      throw new Error(`duplicate value found for ${rev[value]} and ${key}`);
    }
    rev[value] = key;
  });
  return rev;
}

export function encodeConfiguration(configuration) {
  // renameKeys -> msgpack -> base64url -> uri
  const step1 = renameKeys(configuration, encodeMap);
  const step2 = msgpack.encode(step1);
  const step3 = base64url.encode(step2);
  const step4 = encodeURIComponent(step3);

  return step4;
}

export function decodeConfiguration(encodedConfiguration) {
  // allow decoding of share urls
  const i = encodedConfiguration.indexOf('?cfg=');
  if (i !== -1) {
    const start = i + '?cfg='.length;
    encodedConfiguration = encodedConfiguration.substring(start);
  }

  // uri -> base64url -> msgpack -> renameKeys
  const step1 = decodeURIComponent(encodedConfiguration);
  const step2 = base64url.toBuffer(step1);
  const step3 = msgpack.decode(step2);
  const step4 = renameKeys(step3, decodeMap);

  // finally, migrate
  const configuration = util.migrateConfiguration(step4);

  return configuration;
}

export function getShareConfigurationUrl(configuration) {
  const baseUrl = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname.split('/')[1];
  return baseUrl + '?cfg=' + encodeConfiguration(configuration);
}

export function isShareUrl(configurationString) {
  return configurationString.indexOf('?cfg=') !== -1;
}

const keyAppState = "appState";

function isLocalStorageAvailable() {
  return window.localStorage !== undefined;
}

export function getStoredAppState() {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  const json = localStorage.getItem(keyAppState);
  if (json !== null) {
    try {
      const appState = JSON.parse(json);
      appState.configuration = util.migrateConfiguration(appState.configuration);
      return appState;
    }
    catch (error) {
      console.log("could not load stored configuration, see below");
      console.warn(error);
    }
  }
  return null;
}

export function setStoredAppState(appState) {
  if (!isLocalStorageAvailable()) {
    return;
  }

  const json = JSON.stringify(appState);
  localStorage.setItem(keyAppState, json);
}
