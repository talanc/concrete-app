const machineHire_Off = { key: 'off', text: 'Off', value: 'off' };
const machineHire_On = { key: 'on', text: 'On', value: 'on' };

export const machineHireOptions = {
    label: "Machine Hire & Cartage",
    optOff: machineHire_Off,
    optOn: machineHire_On,
    optList: [machineHire_Off, machineHire_On],
    defaultPrice: 200
};

export const minPriceOptions = {
    label: "Minimum Price",
    labelItem: 'Minimum Price Offset',
    defaultPrice: 2500
};
