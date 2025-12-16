interface FileInfo {
  code: string;
  name: string; 
  type: string; 
}

type Input = string | string[];

const processSingleFile = (filename: string): FileInfo => {
  
  const parts = filename.split('-');
  
  
  if (parts.length < 2) {    
    return { code: '', name: filename, type: '' }; 
  }

  const code = parts[0];
  
  const nameWithExtension = parts.slice(1).join('-');  
  
  const lastDotIndex = nameWithExtension.lastIndexOf('.');
  let name = nameWithExtension;
  let type = '';
  
  if (lastDotIndex > 0) {
    name = nameWithExtension.substring(0, lastDotIndex); 
    type = nameWithExtension.substring(lastDotIndex + 1).toUpperCase();
  }

  return {
    code: code,
    name: name,
    type: type,
  };
};

export const getFileDetails = (input: Input): FileInfo[] => {
  let fileNames: string[] = [];
  
  if (typeof input === 'string') {
    fileNames = [input];
  } else if (Array.isArray(input)) {
    fileNames = input;
  } else {    
    return [];
  }  
  return fileNames.map(processSingleFile);
};