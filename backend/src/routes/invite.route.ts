import { Router } from 'express';
import { sendInvite, getInvites ,changeInviteStatus, deleteInvite ,inviteAgain ,updateInvite ,getinvitebyemail ,verifyInviteToken} from '../conttrolers/inivite.controllers';
// import { verifyFirebaseToken } from '../middleware/auth';
import { checkPermission, Permission } from '../middleware/rbac';

const inviterouter = Router();

// Public route for verifying invite tokens
inviterouter.post('/invite/verify-token', verifyInviteToken);

// // All other routes require authentication
// inviterouter.use(verifyFirebaseToken);

inviterouter.post('/send-invite',  sendInvite);
inviterouter.get('/invites', getInvites);
inviterouter.post('/invite/update-status', changeInviteStatus);
inviterouter.delete('/invites/:id', deleteInvite);
inviterouter.post('/resend-invite', inviteAgain);
inviterouter.put('/invites/:id', updateInvite);
inviterouter.get('/invite/:email',  getinvitebyemail);

export default  inviterouter;