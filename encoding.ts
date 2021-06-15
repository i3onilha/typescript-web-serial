export const vendorSpecificEscPos = Object.freeze([
  {
    name: 'Bematech',
    vid: 2843,
    cut: [0x1b, 0x6d]
  },
  {
    name: 'Brother',
    vid: 1273,
    cut: [0x1b, 0x69, 0x4d],
    feed: [0x0c]
  },
  {
    name: 'Daruma',
    vid: 9144,
    cut: [0x1b, 0x6d]
  },
  {
    name: 'Diebold Nixdorf',
    vid: 12156,
    cut: [0x1b, 0x6d]
  },
  {
    name: 'Elgin',
    vid: 12263,
    cut: [0x1d, 0x56, 0x41, 0x00]
  },
  {
    name: 'Epson',
    vid: 1392,
    cut: [0x1d, 0x56, 0x41, 0x00]
  },
  {
    name: 'Gainscha',
    cut: [0x1d, 0x56, 0x41, 0x00]
  },
  {
    name: 'Sweda',
    cut: [0x1d, 0x56, 0x01],
    init: [0x1b, 'm']
  },
  {
    name: 'Tanca',
    cut: [0x1b, 0x6d],
    init: [0x1b, 'm']
  }
]) as VendorSpecific[];

export interface VendorSpecific {
  name: string;
  vid?: number;
  cut?: any[];
  init?: any[];
}
