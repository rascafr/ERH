# ERH - Electron Radio Hacker

Proof-of-concept inspired by [URH](https://github.com/jopohl/urh), built with TypeScript Node, Electron and React.

> 💅 Current status is early stage / work in progress, mostly to test features.

![Preview capture](./media/preview.png)

## Features

- IQ complex data translation into reals
- OOK signal demodulation (low-pass filter)
- Minimum pulse width detection
- Data decoding
- Hex and binary data display
- Efficient infinite radio data / filtered data zoom

## Supported files types

> Currently limited to 100MiB

- `.raw`, `.complex16s`, `*.cs8` (`hackrf-transfer`), signed 8 bits IQ integers
- `.complex16u`, `*.cu8` (unsigned 8 bits IQ signal integers)
- `.complex32s`, `*.cs16` (HackRF recorded) IQ signed 8 bits integers
- `.complex32u`, `*.cu16` (unsigned 16 bits IQ signal integers)

## Install & run

```
git clone git@github.com:rascafr/ERH.git
cd ERH
npm i
npm start
```

## Credits

- Helpful details about [RF file formats](https://www.sdrplay.com/community/viewtopic.php?t=3483)
- Based on [electron-react-boilerplate](https://electron-react-boilerplate.js.org/)
