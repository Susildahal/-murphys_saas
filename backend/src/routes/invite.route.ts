import { Router } from 'express';
import { sendInvite, getInvites, respondToInvite ,rejectInvite , acceptInvite} from '../conttrolers/inivite.controllers';

const inviterouter = Router();

inviterouter.post('/send-invite', sendInvite);
inviterouter.get('/invites', getInvites);
inviterouter.post('/respond-invite', respondToInvite);
inviterouter.post('/invite/accept-invite', acceptInvite);
inviterouter.post('/reject/reject-invite', rejectInvite);

export default  inviterouter;