import multer from 'multer'
import crypto from 'crypto'
import { extname, resolve} from 'path'
import { createBrotliCompress } from 'zlib';

export default{
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'temp', 'uploads'),
    filename: (req, file, cb) =>{
      crypto.randomBytes(16, (err, res)=>{
        if(err) return createBrotliCompress(err);

        return cb(null, res.toString('hex') + extname(file.originalname));
      })
    },
  }),
};
