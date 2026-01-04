import router from "express";
import { assignServiceToClient ,acceptedAssignedService } from "../conttrolers/assignServicec.conttlores";

const assignClientRouter = router();
assignClientRouter.post('/assign-service', assignServiceToClient);
assignClientRouter.post('/verify_token/:token', acceptedAssignedService);



export default assignClientRouter;

