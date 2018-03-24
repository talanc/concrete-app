export function encodeConfiguration(configuration) {
  return encodeURIComponent(btoa(JSON.stringify(configuration)));
}

export function decodeConfiguration(configurationString) {
  // allow decoding of share urls
  const i = configurationString.indexOf('?cfg=');
  if (i !== -1) {
    const start = i + '?cfg='.length;
    configurationString = configurationString.substring(start);
  }

  return JSON.parse(atob(decodeURIComponent(configurationString)));
}

export function getShareConfigurationUrl(configuration) {
  const baseUrl = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname.split('/')[1];
  return baseUrl + '?cfg=' + encodeConfiguration(configuration);
}

export function isShareUrl(configurationString) {
  return configurationString.indexOf('?cfg=') !== -1;
}
