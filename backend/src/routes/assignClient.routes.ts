import router from "express";
import { assignServiceToClient ,acceptedAssignedService,acceptAssignedService  ,getAllAssignedServices ,getAssignDetails ,updateAssignedService ,deleteAssignedService } from "../conttrolers/assignServicec.conttlores";
import { verifyFirebaseToken } from "../middleware/auth";
import { checkPermission, Permission } from "../middleware/rbac";

const assignClientRouter = router();

// Public route for accepting assigned services via token
assignClientRouter.post('/verify_token', acceptedAssignedService);

// All other routes require authentication
assignClientRouter.use(verifyFirebaseToken);

assignClientRouter.post('/assign-service', assignServiceToClient);
assignClientRouter.patch('/accept-assigned-service/:id',  acceptAssignedService);
assignClientRouter.get('/assigned_services', getAllAssignedServices);
assignClientRouter.get('/assign_details/:client_id/:service_catalog_id', getAssignDetails);
assignClientRouter.put('/assigned_services/:id', updateAssignedService);
assignClientRouter.delete('/assigned_services/:id', deleteAssignedService);

export default assignClientRouter;

