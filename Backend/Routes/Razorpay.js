import express from "express"
import {create_order,verify} from "../Controllers/Razorpay.js"
const router = express.Router();

router.post('/create-order',create_order);
router.post('/verify',verify);

export default router