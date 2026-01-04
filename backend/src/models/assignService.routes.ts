import { Mongoose } from "mongoose";


const assignServiceSchema = new Mongoose.Schema({
    client_id: { type: Mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service_catalog_id: { type: Mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    note: { type: String },
    price: { type: String, required: true },
    cycle: { type: String, enum: ['annual', 'monthly', 'none'], required: true },

    start_date: { type: Date, required: true, default: Date.now },
    renewal_date: { type: Date, required: true },
}, { timestamps: true });


const AssignService = Mongoose.model("AssignService", assignServiceSchema);
export default AssignService;