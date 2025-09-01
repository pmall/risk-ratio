
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  deribit: {
    apiUrl: process.env.DERIBIT_API_URL || 'https://www.deribit.com/api/v2',
  },
};
