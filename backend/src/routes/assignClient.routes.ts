import router from "express";
import { assignServiceToClient ,acceptedAssignedService,acceptAssignedService  } from "../conttrolers/assignServicec.conttlores";

const assignClientRouter = router();
assignClientRouter.post('/assign-service', assignServiceToClient);
assignClientRouter.post('/verify_token', acceptedAssignedService);
assignClientRouter.patch('/accept-assigned-service/:id', acceptAssignedService);
// assignClientRouter.get('/assigned_services', getAllAssignedServices);



export default assignClientRouter;

