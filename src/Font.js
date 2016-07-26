// @flow

import {
  NativeModules,
} from 'react-native';

import Asset from './Asset';


const sessionId = NativeModules.ExponentConstants.sessionId;

function nativeName(name) {
  return `${sessionId}-${name}`;
}


const loaded = {};
const loading = {};
const onLoadPromises = {};

export function isLoaded(name: string) {
  return !!loaded[name];
}

export async function loadAsync(nameOrMap, uriOrModuleOrAsset) {
  if (typeof nameOrMap === 'object') {
    const names = Object.keys(nameOrMap);
    await Promise.all(names.map(name => loadAsync(name, nameOrMap[name])));
    return;
  }

  let name = nameOrMap;
  if (loaded[name]) {
    return;
  } else if (loading[name]) {
    await new Promise(resolve => { onLoadPromises[name].push(resolve); });
  } else {
    loading[name] = true;
    onLoadPromises[name] = [];

    let asset;
    if (typeof uriOrModuleOrAsset === 'string') {
      // TODO(nikki): need to implement Asset.fromUri(...)
      asset = Asset.fromUri(uriOrModuleOrAsset);
    } else if (typeof uriOrModuleOrAsset === 'number') {
      asset = Asset.fromModule(uriOrModuleOrAsset);
    } else {
      asset = uriOrModuleOrAsset;
    }

    await asset.downloadAsync();
    if (asset.downloaded) {
      await NativeModules.ExponentFontLoader.loadAsync(nativeName(name), asset.localUri);
    } else {
      throw new Error(`Couldn't download asset for font '${name}'`);
    }

    loaded[name] = true;
    delete loading[name];
    if (onLoadPromises[name]) {
      onLoadPromises[name].forEach(resolve => resolve());
      delete onLoadPromises[name];
    }
  }
}


export function style(name: string, options:{ignoreWarning: bool} = {ignoreWarning: false}) {
  if (!loaded[name] && !options.ignoreWarning) {
    console.warn(`[Exponent.Font] No font '${name}', or it hasn't been loaded yet`);
  }
  return {
    fontFamily: `ExponentFont-${nativeName(name)}`,
  };
}
