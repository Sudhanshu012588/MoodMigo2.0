import express from "express";
import {CreateBlogAccount,fetchAccount} from "../Controllers/BlogAccount.js"
import {createBlog,fetchBlog,Like,heart} from "../Controllers/Blogs.js"


const Blogrouter = express.Router();

Blogrouter.post("/CreateAccount",CreateBlogAccount)
Blogrouter.post("/fetch",fetchAccount)
Blogrouter.post("/createblog",createBlog)
Blogrouter.get("/fetchBlog",fetchBlog)
Blogrouter.get("/like",Like)
Blogrouter.get("/heart",heart)
export default Blogrouter; 
