import { Router } from 'express';
import { sendInvite, getInvites ,rejectInvite , acceptInvite , deleteInvite ,inviteAgain ,updateInvite} from '../conttrolers/inivite.controllers';

const inviterouter = Router();

inviterouter.post('/send-invite', sendInvite);
inviterouter.get('/invites', getInvites);
inviterouter.post('/invite/accept-invite', acceptInvite);
inviterouter.post('/reject/reject-invite', rejectInvite);
inviterouter.delete('/invites/:id', deleteInvite);
inviterouter.post('/resend-invite', inviteAgain);
inviterouter.put('/invites/:id', updateInvite);

export default  inviterouter;