import React, { Fragment } from 'react';

export function sqm(value) {
    return <Fragment>{value}m<sup>2</sup></Fragment>;
}

export const m2 = <Fragment>m<sup>2</sup></Fragment>;

export const m3 = <Fragment>m<sup>3</sup></Fragment>;

export const per_m2 = <Fragment>per {m2}</Fragment>;

export const per_m3 = <Fragment>per {m3}</Fragment>;