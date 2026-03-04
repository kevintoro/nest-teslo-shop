import { v4 as uuid } from 'uuid';

export const fileNamer = (
  request: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, fileName: string) => void,
) => {
  if (!file) {
    return callback(new Error('File is empty'), '');
  }

  const fileExtension = file.mimetype.split('/').pop() || '';
  if (!fileExtension) {
    return callback(new Error('File type is not recognized'), '');
  }

  const fileName = uuid() + '.' + fileExtension;
  callback(null, fileName);
};
