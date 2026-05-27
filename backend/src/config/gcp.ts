export const getGcpUrl = (src: string): string => {
  if (src.startsWith('gs://')) {
    const bucketAndPath = src.replace('gs://', '');
    const [bucket, ...pathParts] = bucketAndPath.split('/');
    const path = pathParts.join('/');
    return `https://storage.googleapis.com/${bucket}/${path}`;
  }
  
  if (src.includes('storage.googleapis.com')) {
    return src;
  }
  
  return src;
};
