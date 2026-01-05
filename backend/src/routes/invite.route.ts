import { Router } from 'express';
import { sendInvite, getInvites ,changeInviteStatus, deleteInvite ,inviteAgain ,updateInvite ,getinvitebyemail ,verifyInviteToken} from '../conttrolers/inivite.controllers';

const inviterouter = Router();

inviterouter.post('/send-invite', sendInvite);
inviterouter.post('/invite/verify-token', verifyInviteToken);
inviterouter.get('/invites', getInvites);
inviterouter.post('/invite/update-status', changeInviteStatus);
inviterouter.delete('/invites/:id', deleteInvite);
inviterouter.post('/resend-invite', inviteAgain);
inviterouter.put('/invites/:id', updateInvite);
inviterouter.get('/invite/:email', getinvitebyemail);

export default  inviterouter;