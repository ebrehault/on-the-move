import { latLng, LatLng } from 'leaflet';

// from https://github.com/exif-js/exif-js/blob/master/exif.js
export function getImageGPSPosition(picture: File) {
  return picture.arrayBuffer().then((file) => {
    try {
      let offset = 2;
      const length = file.byteLength;
      const dataView = new DataView(file);
      if (dataView.getUint8(0) != 0xff || dataView.getUint8(1) != 0xd8) {
        console.log('Not a valid JPEG');
      }
      while (offset < length) {
        if (dataView.getUint8(offset) != 0xff) {
          return undefined;
        }

        const marker = dataView.getUint8(offset + 1);
        if (marker == 225) {
          return readEXIFData(dataView, offset + 4);
        } else {
          offset += 2 + dataView.getUint16(offset + 2);
        }
      }
      return undefined;
    } catch {
      console.error('Error when extracting picture GPS data.');
      return Promise.resolve(undefined);
    }
  });
}

function readEXIFData(file: DataView<ArrayBuffer>, start: number) {
  const tiffOffset = start + 6;
  let bigEnd = false;
  if (file.getUint16(tiffOffset) == 0x4949) {
    bigEnd = false;
  } else if (file.getUint16(tiffOffset) == 0x4d4d) {
    bigEnd = true;
  } else {
    return undefined;
  }
  if (file.getUint16(tiffOffset + 2, !bigEnd) != 0x002a) {
    return undefined;
  }

  const firstIFDOffset = file.getUint32(tiffOffset + 4, !bigEnd);
  const tags = readTags(
    file,
    tiffOffset,
    tiffOffset + firstIFDOffset,
    bigEnd,
    false,
  );
  return tags;
}

function readTags(
  file: DataView<ArrayBuffer>,
  tiffStart: number,
  dirStart: number,
  bigEnd: boolean,
  gps: boolean,
): LatLng | undefined {
  const entries = file.getUint16(dirStart, !bigEnd);
  let entryOffset = 0;
  let latRef: any;
  let lat: any;
  let lngRef: any;
  let lng: any;

  for (let i = 0; i < entries; i++) {
    entryOffset = dirStart + i * 12 + 2;
    const data = file.getUint16(entryOffset, !bigEnd);
    if (!gps && data === 0x8825) {
      const geoTags = readTagValue<number>(
        file,
        entryOffset,
        tiffStart,
        bigEnd,
      );
      return geoTags !== undefined
        ? readTags(file, tiffStart, tiffStart + geoTags, bigEnd, true)
        : undefined;
    }
    if (gps) {
      if (data === 0x0001) {
        latRef = readTagValue<Direction>(file, entryOffset, tiffStart, bigEnd);
      }
      if (data === 0x0002) {
        lat = readTagValue<number[]>(file, entryOffset, tiffStart, bigEnd);
      }
      if (data === 0x0003) {
        lngRef = readTagValue<Direction>(file, entryOffset, tiffStart, bigEnd);
      }
      if (data === 0x0004) {
        lng = readTagValue<number[]>(file, entryOffset, tiffStart, bigEnd);
      }
    }
  }
  if (!gps) {
    return undefined;
  } else {
    const latNum = convertDMSToDD(lat[0], lat[1], lat[2], latRef);
    const lngNum = convertDMSToDD(lng[0], lng[1], lng[2], lngRef);
    if (isNaN(latNum) || isNaN(lngNum)) {
      return undefined;
    } else {
      return latLng(latNum, lngNum);
    }
  }
}

function readTagValue<T>(
  file: DataView<ArrayBuffer>,
  entryOffset: number,
  tiffStart: number,
  bigEnd: boolean,
): T | undefined {
  let type = file.getUint16(entryOffset + 2, !bigEnd),
    numValues = file.getUint32(entryOffset + 4, !bigEnd),
    valueOffset = file.getUint32(entryOffset + 8, !bigEnd) + tiffStart,
    offset,
    vals,
    val,
    n,
    numerator,
    denominator;
  switch (type) {
    case 2: // ascii, 8-bit byte
      offset = numValues > 4 ? valueOffset : entryOffset + 8;
      return getStringFromDB(file, offset, numValues - 1) as T;

    case 4: // long, 32 bit int
      if (numValues == 1) {
        return file.getUint32(entryOffset + 8, !bigEnd) as T;
      } else {
        vals = [];
        for (n = 0; n < numValues; n++) {
          try {
            vals[n] = file.getUint32(valueOffset + 4 * n, !bigEnd);
          } catch {
            continue;
          }
        }
        return vals as T;
      }

    case 5: // rational = two long values, first is numerator, second is denominator
      if (numValues == 1) {
        numerator = file.getUint32(valueOffset, !bigEnd);
        denominator = file.getUint32(valueOffset + 4, !bigEnd);
        val = new Number(numerator / denominator);

        return val as T;
      } else {
        vals = [];
        for (n = 0; n < numValues; n++) {
          numerator = file.getUint32(valueOffset + 8 * n, !bigEnd);
          denominator = file.getUint32(valueOffset + 4 + 8 * n, !bigEnd);
          vals[n] = new Number(numerator / denominator);
        }
        return vals as T;
      }
  }
}

function getStringFromDB(
  buffer: DataView<ArrayBuffer>,
  start: number,
  length: number,
) {
  var outstr = '';
  for (let n = start; n < start + length; n++) {
    try {
      outstr += String.fromCharCode(buffer.getUint8(n));
    } catch {
      continue;
    }
  }
  return outstr;
}

type Direction = 'N' | 'S' | 'W' | 'E';
function convertDMSToDD(
  degrees: number,
  minutes: number,
  seconds: number,
  direction: Direction,
): number {
  let dd = degrees + minutes / 60 + seconds / 3600;
  if (direction == 'S' || direction == 'W') {
    dd = dd * -1;
  }
  return dd;
}
