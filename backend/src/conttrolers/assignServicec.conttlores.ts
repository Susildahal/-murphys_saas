import Profile from "../models/profile.model";
import Service from "../models/service.model";
import AssignService from "../models/assignService.routes";
import { Request, Response } from "express";
import transporter from "../config/nodemiller";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()

interface JwtPayload {
  email: string;
  iat: number;
  exp: number;
}

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
        client_name: fullname,
        service_name: useExistingService.name,
    });
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET as string, { expiresIn: '7d' }); // Token valid for 7 days
    
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
                <p> Click Here to accept tis service: <a href="${process.env.frontendurl}/verify/encoadedurl:${token}">Murphys Client Portal</a></p>
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
        const {token } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
        const decodedToken = jwt.decode(token) as { exp?: number } | null;
        if (decodedToken?.exp && Math.floor(Date.now() / 1000) > decodedToken.exp) {
          return res.status(401).json({ message: 'Token has expired' });
        }
        const assignedService = await AssignService.findOne({ email: decoded.email, isaccepted: 'pending' });
        
    
        if (!assignedService) {
            return res.status(404).json({ message: 'No pending assigned service found for this email' });
        }
const userProfile = await Profile.findOne({ email: decoded.email });
        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found' });
        }
  
        res.status(200).json({ data: {assignedService, userProfile}, message: 'Assigned service accepted successfully' });
    }
    catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

 export const acceptAssignedService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {isaccepted } = req.body;
        const assignedService = await AssignService.findById(id);
        if (!assignedService) {
            return res.status(404).json({ message: 'Assigned service not found' });
        }
        assignedService.isaccepted = isaccepted;
        await assignedService.save();
        res.status(200).json({ data: assignedService, message: 'Assigned service accepted successfully' });
    }
    catch (error) {

        res.status(400).json({ message: (error as Error).message });
    }
};




export const getAllAssignedServices = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const searchQuery = req.query.search as string || '';

  try {
    let query = {};
    if (searchQuery) {
      query = {
        $or: [
          { client_name: { $regex: searchQuery, $options: 'i' } },
          { service_name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
        ],
      };
    }

    const [totalCount, assignedServices] = await Promise.all([
      AssignService.countDocuments(),
      AssignService.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),

    ]);
    res.status(200).json({ data: assignedServices, pagination: {  totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) }, message: 'Assigned services retrieved successfully' });
  }
  catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAssignDetails = async (req: Request, res: Response) => {
  try {
    const { client_id } = req.params as any;
    const { service_catalog_id } = req.params as any;

    if (!client_id || !service_catalog_id) {
      return res.status(400).json({ message: 'client_id and service_catalog_id are required' });
    }

    const [clientProfile, service] = await Promise.all([
      Profile.findById(client_id),
      Service.findById(service_catalog_id),
    ]);
    if (!clientProfile || !service) {
      return res.status(404).json({ message: 'Client or Service not found' });
    }
    res.status(200).json({ data: { clientProfile, service }, message: 'Assigned service retrieved successfully' });
  }
  catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};







