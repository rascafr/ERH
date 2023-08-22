import fs from 'fs';

function parseReal(data: any) {
  const parsed = [];
  for (let i = 0; i < data.length; ) {
    parsed.push(Math.sqrt(data[i++] ** 2 + data[i++] ** 2));
  }
  return parsed;
}

export function uint8parser(filePath: string) {
  const fileBuffer = new Uint8Array(fs.readFileSync(filePath));

  return parseReal(fileBuffer);
}

export function register() {
  // .cu8, .complex16u using two unsigned 8 Bit integers for I and Q
  return {
    name: 'uint8',
    parser: uint8parser,
    extensions: ['cu8', 'complex16u'],
  };
}
