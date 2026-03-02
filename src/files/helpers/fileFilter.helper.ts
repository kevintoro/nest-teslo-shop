export const fileFilter = (
  request: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file) {
    return callback(new Error('File is empty'), false);
  }

  const fileExtension = file.mimetype.split('/').pop() || '';
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  if (allowedExtensions.includes(fileExtension)) {
    return callback(null, true);
  }

  callback(null, false);
};
