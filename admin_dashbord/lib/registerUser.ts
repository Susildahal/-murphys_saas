import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/config/firebase";

export async function registerUser(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}
