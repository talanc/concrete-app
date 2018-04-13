import * as storage from './storage';

const obj = {
  id: null,
  isDefault: true,
  name: "Default",
  concreteRates: [
    { key: 0, limit: 10, rate: 101 },
    { key: 1, limit: 20, rate: 95 },
    { key: 2, limit: 40, rate: 90 },
    { key: 3, limit: 60, rate: 80 },
    { key: 4, limit: 120, rate: 70 },
    { key: 5, limit: null, rate: 63 },
  ],
  slabThickness125: 10,
  meshThicknessSL82: 4.5,
  pumpOn: 950,
  pumpDouble: 1900,
  polyMembraneOn: 3.5,
  rock: [
    { key: 0, limit: null, rate: 50}
  ],
  taxRate: 10
};

it('obj matches obj->encode->decode', () => {
  const newObj = storage.decodeConfiguration(storage.encodeConfiguration(obj));
  expect(obj).toMatchObject(newObj);
});
