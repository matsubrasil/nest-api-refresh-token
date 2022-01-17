import * as bcrypt from 'bcrypt';

export const hashData = (data: string) => {
  return bcrypt.hash(data, 10);
};
