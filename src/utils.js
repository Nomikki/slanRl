export const initMessages = {
  "Build date": BUILD_DATE,
  "Build time": BUILD_TIME,
  "Build datetime": BUILD_DATETIME,
  "Commit hash": COMMIT_HASH,
  Version: VERSION,
};

export const paddedLogObject = (object) => {
  const maxKeyLength = Object.keys(object).reduce(
    (previousValue, currentValue) =>
      currentValue.length + 3 > previousValue
        ? currentValue.length + 3
        : previousValue,
    0
  );

  console.log(
    Object.keys(object)
      .map((key) => `${key.padEnd(maxKeyLength, " ")}: ${object[key]}`)
      .join("\n")
  );
};

export const printVersion = () => {
  const versionContent = `Commit ID: <span>${COMMIT_HASH}</span> | Version: <span>${VERSION}</span>`;
  document.querySelector("#version").innerHTML = versionContent;
};

export const debugInit = () => {
  printVersion();
  paddedLogObject(initMessages);
};
