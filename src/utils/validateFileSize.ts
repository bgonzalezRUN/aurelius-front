const MAX_FILE_SIZE = 10485760;

export const validateFileSize = (
  value: File | File[] | FileList,  
) => {
  if (!value) return true;

  const files =
    value instanceof FileList || Array.isArray(value)
      ? Array.from(value)
      : [value];

  const invalidFile = files.find(file => file.size > MAX_FILE_SIZE);

  if (invalidFile) {
    const sizeInMB = MAX_FILE_SIZE / 1024 / 1024;
    return `El archivo "${invalidFile.name}" excede el límite de ${sizeInMB} MB.`;
  }

  return true;
};
