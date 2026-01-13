import mongoose from 'mongoose';


const assignServiceSchema = new mongoose.Schema({
    invoice_id:{ type:String, required:true },
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client_name: { type: String, required: true },
    service_catalog_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    service_name: { type: String, required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled' ,'paused'], default: 'active' },
    note: { type: String },
    price: { type: String, required: true },
    cycle: { type: String, enum: ['annual', 'monthly', 'none'], required: true },
    start_date: { type: Date, required: true, default: Date.now },
    end_date: { type: Date, required: true },
    renewal_dates: [{
        label: { type: String, required: true },
        date: { type: Date, required: true },
        price: { type: Number, required: true },
        haspaid: { type: Boolean, default: false },
    }],
    auto_invoice: { type: Boolean, default: false },
    isaccepted: { type: String,  enum: ["accepted", "rejected" ,"pending" ,], default: "pending" },
    email: { type: String, required: true },
}, { timestamps: true });


const AssignService = mongoose.model("AssignService", assignServiceSchema);
export default AssignService;