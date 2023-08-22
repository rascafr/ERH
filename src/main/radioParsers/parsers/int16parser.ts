import fs from 'fs';

function parseReal(data: any) {
  const parsed = [];
  for (let i = 0; i < data.length; ) {
    parsed.push(Math.sqrt(data[i++] ** 2 + data[i++] ** 2));
  }
  return parsed;
}

export function int16parser(filePath: string) {
  const fileBuffer = new Int16Array(fs.readFileSync(filePath));

  return parseReal(fileBuffer);
}

export function register() {
  // cs16, .complex32s using two signed 16 Bit integers for I and Q
  return {
    name: 'int16',
    parser: int16parser,
    extensions: ['cs16', 'complex32s'],
  };
}
