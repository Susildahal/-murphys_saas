import Profile from "../models/profile.model";
import Service from "../models/service.model";
import AssignService from "../models/assignService.routes";
import { Request, Response } from "express";
import transporter from "../config/nodemiller";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()


export const assignServiceToClient = async (req: Request, res: Response) => {
  try {
    const {   client_id, service_catalog_id, status, note, price, cycle , auto_invoice, start_date,  renewal_date  } = req.body;
    if (!client_id || !service_catalog_id || !price || !cycle) {
      return res.status(400).json({ message: 'client_id, service_catalog_id, price, and cycle are required' });
    }
    const useExistingService = await Service.findById(service_catalog_id);
    if (!useExistingService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    const clientProfile = await Profile.findById(client_id);
    if (!clientProfile) {
      return res.status(404).json({ message: 'Client profile not found' });
    }
    const email = clientProfile.email;
    const fullname = clientProfile.firstName + ' ' + clientProfile.lastName;

    const assignedService = new AssignService({
      client_id,
      service_catalog_id,
        status,
        note,
        price,
        cycle,
        isaccepted: "pending",
        auto_invoice,
        start_date,
        renewal_date,
        email,
    });
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    
    await assignedService.save();
 const emailoptions = {
      from: `Murphys Client <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'New Service Assigned',
        html: `<p>Dear ${fullname},</p>
               <p>A new service has been assigned to you. this is start from the ${start_date} Please log in to your account to view the details.</p>
                <p>Service Details:</p>
                <ul>
                    <li>Service Name: ${useExistingService.name}</li>
                    <li>Description: ${useExistingService.description}</li>
                    <li>Price: ${price} ${useExistingService.currency}</li>
                    <li> Renewal Date: ${renewal_date}</li>
                    <li>Billing Cycle: ${cycle}</li>
                </ul>
                <p> If you have any questions or need further assistance, please do not hesitate to contact our support team.</p>
                <p> Click Here to accept tis service: <a href="${process.env.frontendurl}/admin/verify/encoadedurl:${token}">Murphys Client Portal</a></p>
                <p>Thank you for choosing Murphys Client!

               </p>
               <p>Best regards,<br/>Murphys Team</p>`
    };
    await transporter.sendMail(emailoptions); 
    res.status(201).json({ data: assignedService, message: 'Service assigned to client successfully' });
  }
    catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const acceptedAssignedService = async (req: Request, res: Response) => {
    try {
        const {token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
        const assignedService = await AssignService.findOne({ email: decoded.email, isaccepted: 'pending' });
        if (!assignedService) {
            return res.status(404).json({ message: 'No pending assigned service found for this email' });
        }
        assignedService.isaccepted = 'accepted';
        await assignedService.save();
        res.status(200).json({ data: assignedService, message: 'Assigned service accepted successfully' });
    }
    catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};






