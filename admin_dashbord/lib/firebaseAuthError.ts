export const getFirebaseAuthErrorMessage = (error: any): string => {
  if (!error || !error.code) {
    return "Something went wrong. Please try again.";
  }

  switch (error.code) {

    case "auth/invalid-email":
      return "The email address is not valid.";


      case "INVALID_LOGIN_CREDENTIALS":
      return "Invalid login credentials. Please check your email and password.";

    case "auth/wrong-password":
      return "Current password is incorrect.";

    case "auth/weak-password":
      return "New password is too weak. Please use at least 6 characters.";

    case "auth/requires-recent-login":
      return "For security reasons, please log in again and retry.";

    case "auth/user-not-found":
      return "User account not found.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    default:
      return "Failed to change password. Please try again.";
  }
};

export default getFirebaseAuthErrorMessage;
