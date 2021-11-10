export const paddedLogObject = (object: { [k in string]: string }) => {
  const maxKeyLength = Object.keys(object).reduce(
    (previousValue, currentValue) =>
      currentValue.length + 3 > previousValue
        ? currentValue.length + 3
        : previousValue,
    0,
  );

  console.log(
    Object.keys(object)
      .map(key => `${key.padEnd(maxKeyLength, " ")}: ${object[key]}`)
      .join("\n"),
  );
};

export const populateVersion = () =>
  `Commit ID: <span>${COMMIT_HASH}</span> | Version: <span>${VERSION}</span>`;

export const printVersionContainer = () => {
  ensure(document.querySelector("#version")).innerHTML = populateVersion();
};

export const debugInit = () => {
  // Populates the content for "version" div in the bottom right corner
  printVersionContainer();

  // Console logs a padded object
  paddedLogObject({
    BUILD_DATE: BUILD_DATE,
    BUILD_TIME: BUILD_TIME,
    BUILD_DATETIME: BUILD_DATETIME,
    COMMIT_HASH: COMMIT_HASH,
    VERSION: VERSION,
  });
};

export const float2int = (value: number): number => {
  return value >> 0;
};

export const ensure = <T>(
  argument: T | undefined | null,
  message = "This value was promised to be there.",
): T => {
  if (argument === undefined || argument === null) {
    throw new TypeError(message);
  }

  return argument;
};

export const hexToRGB = (h: string) => {
  let r = 0;
  let g = 0;
  let b = 0;

  // 3 digits
  if (h.length == 4) {
    r = parseInt(`0x${h[1]}${h[1]}`, 16);
    g = parseInt(`0x${h[2]}${h[2]}`, 16);
    b = parseInt(`0x${h[3]}${h[3]}`, 16);

    // 6 digits
  } else if (h.length == 7) {
    r = parseInt(`0x${h[1]}${h[2]}`, 16);
    g = parseInt(`0x${h[3]}${h[4]}`, 16);
    b = parseInt(`0x${h[5]}${h[6]}`, 16);
  }

  return [r, g, b];
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const dimmerColor = (color: string, dim: number): string => {
  let [r, g, b] = hexToRGB(color);
  r *= dim;
  g *= dim;
  b *= dim;
  if (r < 0) r = 0;
  if (g < 0) g = 0;
  if (b < 0) b = 0;

  if (r > 255) r = 255;
  if (g > 255) g = 255;
  if (b > 255) b = 255;

  r = float2int(r);
  g = float2int(g);
  b = float2int(b);

  return rgbToHex(r, g, b);
};
