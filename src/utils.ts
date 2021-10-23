export const paddedLogObject = (object: { [k in string]: string }) => {
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

export const populateVersion = () =>
  `Commit ID: <span>${COMMIT_HASH}</span> | Version: <span>${VERSION}</span>`;

export const printVersionContainer = () => {
  document.querySelector("#version")!.innerHTML = populateVersion();
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