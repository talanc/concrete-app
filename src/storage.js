export function encodeConfiguration(configuration) {
  return encodeURIComponent(btoa(JSON.stringify(configuration)));
}

export function decodeConfiguration(configurationString) {
  // make share urls compatible
  const i = configurationString.indexOf('?cfg=');
  if (i !== -1) {
    const start = i + '?cfg='.length;
    configurationString = configurationString.substring(start);
  }

  return JSON.parse(atob(decodeURIComponent(configurationString)));
}

export function getShareConfigurationUrl(configuration) {
  return "http://example.com/?cfg=" + encodeConfiguration(configuration);
}
