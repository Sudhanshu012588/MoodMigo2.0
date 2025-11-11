import express from "express"
import {getcacheData,updateCache} from "../Controllers/CacheData.js"

const router = express.Router();

router.get('/getData/:userId',getcacheData);
router.post('/updateCache',updateCache);
export default router;