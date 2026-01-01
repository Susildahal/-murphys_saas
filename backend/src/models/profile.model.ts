import mongoose from "mongoose";
const profileSchema = new mongoose.Schema({ 
bio :{type: String },
city: { type: String },
country: { type: String },
dob: { type: Date },
doj: { type: Date },
email: { type: String , required: true, unique: true , lowercase: true, trim: true },
firstName: { type: String },
gender: { type: String },
lastName: { type: String },
middleName: { type: String },
phone: { type: String },
position: { type: String },
state: { type: String },
website: { type: String },
profile_image: { type: String },
public_id: { type: String },
invite_type: { type: String, enum: ['invite', 'non invite'], default: 'non invite' },
invite_email: { type: String },
inviteStatus: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },

}, { timestamps: true });

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;         