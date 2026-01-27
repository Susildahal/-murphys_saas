import router from "express";
import { assignServiceToClient ,acceptedAssignedService,acceptAssignedService  ,getAllAssignedServices ,getAssignDetails ,updateAssignedService ,deleteAssignedService, markRenewalAsPaid } from "../conttrolers/assignServicec.conttlores";
import { verifyFirebaseToken } from "../middleware/auth";
// import { checkPermission, Permission } from "../middleware/rbac";
import {isAdmin} from "../middleware/rbac";

const assignClientRouter = router();

// Public route for accepting assigned services via token
assignClientRouter.post('/verify_token', acceptedAssignedService);

// All other routes require authentication
// assignClientRouter.use(verifyFirebaseToken);

assignClientRouter.post('/assign-service', verifyFirebaseToken, isAdmin, assignServiceToClient);
assignClientRouter.patch('/accept-assigned-service/:id', verifyFirebaseToken,  acceptAssignedService);
assignClientRouter.get('/assigned_services', verifyFirebaseToken, getAllAssignedServices);
assignClientRouter.get('/assign_details/:client_id/:service_catalog_id', verifyFirebaseToken, getAssignDetails);
assignClientRouter.put('/assigned_services/:id', verifyFirebaseToken,isAdmin, updateAssignedService);
assignClientRouter.delete('/assigned_services/:id', verifyFirebaseToken, isAdmin, deleteAssignedService);
assignClientRouter.patch('/assigned_services/:id/renewals/:renewal_id/pay', verifyFirebaseToken, isAdmin, markRenewalAsPaid);

export default assignClientRouter;

