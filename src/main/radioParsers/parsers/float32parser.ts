import fs from 'fs';

function parseReal(data: any) {
  const parsed = [];
  for (let i = 0; i < data.length; ) {
    parsed.push(Math.sqrt(data[i++] ** 2 + data[i++] ** 2));
  }
  return parsed;
}

export function float32parser(filePath: string) {
  const fileBuffer = new Float32Array(fs.readFileSync(filePath));

  return parseReal(fileBuffer);
}

export function register() {
  // .complex files with complex64 samples (32 Bit float for I and Q, respectively)
  return {
    name: 'float32',
    parser: float32parser,
    extensions: ['complex'],
  };
}
