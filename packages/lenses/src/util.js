import * as R from 'ramda';
import * as L from 'partial.lenses';
import * as RA from 'ramda-adjunct';

// MIKE: write a type siganture for this using this notation:
// https://github.com/ramda/ramda/wiki/Type-Signatures
export const lensSelect = R.pipe(
  R.mapObjIndexed(R.ifElse(
    RA.isNotFunction,
    R.unary(L.get),
    R.identity,
  )),
  R.applySpec,
);
