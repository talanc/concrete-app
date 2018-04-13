import React, { Fragment } from 'react';

export function generateKey(arr) {
  const fn = (curr) => curr.key === key;

  let key = arr.length;
  while (true) {
    if (arr.filter(fn).length === 0)
      return key;
    key++;
  }
}

export function migrateConfiguration(configuration) {
  // migrate rock: number to a rates system (like concreteRates)
  if (typeof configuration.rock === 'number') {
    console.log("migrateConfiguration: rock rates system");
    const rock = configuration.rock;
    configuration = {
      ...configuration,
      rock: [
        {
          key: 0,
          limit: null,
          rate: rock
        }
      ]
    }
  }

  return configuration;
}

export function sqm(value) {
  return <Fragment>{value}m<sup>2</sup></Fragment>;
}

export const m2 = <Fragment>m<sup>2</sup></Fragment>;

export const m3 = <Fragment>m<sup>3</sup></Fragment>;

export const per_m2 = <Fragment>per {m2}</Fragment>;

export const per_m3 = <Fragment>per {m3}</Fragment>;
