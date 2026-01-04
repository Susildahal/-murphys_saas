import mongoose from 'mongoose';


const assignServiceSchema = new mongoose.Schema({
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service_catalog_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    note: { type: String },
    price: { type: String, required: true },
    cycle: { type: String, enum: ['annual', 'monthly', 'none'], required: true },
    start_date: { type: Date, required: true, default: Date.now },
    renewal_date: { type: Date, required: true },
    auto_invoice: { type: Boolean, default: false },
    isaccepted: { type: String,  enum: ["accepted", "rejected" ,"pending"], default: "pending" },
    email: { type: String, required: true },

}, { timestamps: true });


const AssignService = mongoose.model("AssignService", assignServiceSchema);
export default AssignService;