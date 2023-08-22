import { IPCIQPayload } from './types';
import { parseRadioFile } from './radioParsers';

function filterRC(arr: number[]) {
  const out = [arr[0]];
  const alpha = 0.02;
  for (let i = 1; i < arr.length; i++) {
    out.push(out[out.length - 1] + alpha * (arr[i] - out[out.length - 1]));
  }

  return out;
}

function avg(arr: number[]) {
  return arr.reduce((p, c) => p + c, 0) / arr.length;
}

function threshDetect(arr: number[], avgLevel: number) {
  return arr.map((v) => (v > avgLevel ? 40 : 0));
}

export function decimate(arr: number[], N: number) {
  const decimated = [];
  for (let i = 0; i < arr.length; i++) {
    if (i % N === 0) {
      decimated.push(arr[i]);
    }
  }
  return decimated;
}

function detectMinPulseWidth(arr: number[]) {
  let i = 0;
  const widths = [];
  const widthSet: Record<string, number> = {};
  while (i < arr.length) {
    const lvl = arr[i];
    const iStart = i;
    while (arr[i] === lvl && i < arr.length) i++;
    widths.push(i - iStart);

    const diff = i - iStart;
    if (widthSet[diff]) {
      widthSet[diff]++;
    } else {
      widthSet[diff] = 1;
    }
  }

  const groups: { value: number; count: number }[] = [];

  // group width sets
  Object.entries(widthSet).forEach(([key]) => {
    const curV = parseInt(key, 10);
    const possibleGroup = groups.find(
      (g) => g.value < curV * 1.3 && g.value > curV * 0.7
    );
    if (possibleGroup) {
      possibleGroup.count++;
    } else {
      groups.push({
        value: curV,
        count: 1,
      });
    }
  });

  const totalCount = Object.keys(widthSet).length;

  // only keep groups that occurs more than 10%
  const filteredGroups = groups.filter((g) => g.count / totalCount >= 0.1);

  return filteredGroups.sort((a, b) => a.value - b.value)[0].value;
}

function signalToPulses(arr: number[]) {
  const widths = [];
  let i = 0;
  while (i < arr.length) {
    const lvl = arr[i];
    const iStart = i;
    while (arr[i] === lvl && i < arr.length) i++;
    widths.push({ level: lvl > 0 ? 1 : 0, diff: i - iStart });
  }
  return widths;
}

function trimEnd0(str: string) {
  let endIndex = str.length - 1;
  while (endIndex >= 0 && str[endIndex] === '0') {
    endIndex--;
  }

  return str.substring(0, endIndex + 1);
}

function signalToBinSequence(arr: number[], minPulse: number) {
  let i = 0;

  while (arr[i] === arr[0] && i < arr.length) i++;

  const pulses = signalToPulses(arr);

  pulses.shift(); // remove first 00's
  // still a 0? trim again
  if (pulses[0].level === 0) {
    pulses.shift();
  }
  // pulses.pop(); // remove last 00's
  let binSequence = '';
  pulses.forEach(({ diff, level }) => {
    const pulsesGap = Math.round(diff / minPulse);
    if (pulsesGap >= 1) {
      binSequence += `${level}`.repeat(pulsesGap);
    }
  });

  // remove extra O's, but pad end to make it a multiple of 4
  // binSequence = binSequence.replace(/0*$/, '');
  binSequence = trimEnd0(binSequence);
  binSequence += '0'.repeat(4 - (binSequence.length % 4));

  const split4sequence = binSequence.match(/.{1,4}/g) || [];

  const hexSequence = split4sequence
    .map((hex4) => parseInt(hex4, 2).toString(16))
    .join('');

  return { hexSequence: trimEnd0(hexSequence), binSequence };
}

// eslint-disable-next-line import/prefer-default-export
export function openFile(path: string): IPCIQPayload {
  const reals = parseRadioFile(path);
  const filtered = filterRC(reals);
  const avgLevel = Math.ceil(avg(filtered));
  const binaryLevels = threshDetect(filtered, avgLevel);
  const minPulseWidth = detectMinPulseWidth(binaryLevels);
  const { hexSequence, binSequence } = signalToBinSequence(
    binaryLevels,
    minPulseWidth
  );

  return {
    fileName: path,
    data: reals,
    filteredData: filtered,
    binaryLevels,
    avgLevel,
    minPulseWidth,
    hexSequence,
    binSequence,
    size: reals.length,
    sampleSpeed: 2000000,
    frequency: 433.92,
  };
}
