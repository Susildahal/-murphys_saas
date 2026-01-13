import  express from "express";
import { createNotice, getNotices, deleteNotice } from "../conttrolers/notic.conttrolers";
const noticeRouter = express.Router();

// Public route to create a new notice
noticeRouter.post('/notices', createNotice);
// Public route to get all notices
noticeRouter.get('/notices', getNotices);
// Public route to delete a notice by ID
noticeRouter.delete('/notices/:id', deleteNotice);
export default noticeRouter;



