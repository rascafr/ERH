import fs from 'fs';

function parseReal(data: any) {
  const parsed = [];
  for (let i = 0; i < data.length; ) {
    parsed.push(Math.sqrt(data[i++] ** 2 + data[i++] ** 2));
  }
  return parsed;
}

export function uint16parser(filePath: string) {
  const fileBuffer = new Uint16Array(fs.readFileSync(filePath));

  return parseReal(fileBuffer);
}

export function register() {
  // cu16, .complex32u using two unsigned 16 Bit integers for I and Q
  return {
    name: 'uint16',
    parser: uint16parser,
    extensions: ['cu16', 'complex32u'],
  };
}
