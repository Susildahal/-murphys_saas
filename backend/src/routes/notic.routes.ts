import  express from "express";
import { createNotice, getNotices, deleteNotice ,toggleNoticeStatus } from "../conttrolers/notic.conttrolers";
const noticeRouter = express.Router();

// Public route to create a new notice
noticeRouter.post('/notices', createNotice);
// Public route to get all notices
noticeRouter.get('/notices', getNotices);
// Public route to delete a notice by ID
noticeRouter.delete('/notices/:id', deleteNotice);
// Public route to toggle notice status
noticeRouter.post('/notices/toggleStatus', toggleNoticeStatus);
export default noticeRouter;



