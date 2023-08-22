import fs from 'fs';

function parseReal(data: any) {
  const parsed = [];
  for (let i = 0; i < data.length; ) {
    parsed.push(Math.sqrt(data[i++] ** 2 + data[i++] ** 2));
  }
  return parsed;
}

export function int8parser(filePath: string) {
  const fileBuffer = new Int8Array(fs.readFileSync(filePath));

  return parseReal(fileBuffer);
}

export function register() {
  // .cs8, .complex16s using two signed 8 Bit integers for I and Q
  return {
    name: 'int8',
    parser: int8parser,
    extensions: ['cs8', 'complex16s', 'raw'],
  };
}
