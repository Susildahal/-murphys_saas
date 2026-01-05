// 'use client';

// import { useParams } from 'next/navigation';
// import axiosInstance from '@/lib/axios';
// import React, { useEffect } from 'react';

// export default function Page() {
//   const params = useParams();
  
//   // The key 'token' matches the folder name [token]
//   const token = params.token;
//   if(!token){
//     return <div>No token provided</div>;
//   }
//   const  verifyToken = async (token: string) => {
//     try {
//       const response = await axiosInstance.post('/verify-token', { token } );
//         console.log('Token verification response:', response.data);
//     } catch (error) {
//         console.error('Error verifying token:', error);
//     }
//   }
//     // useEffect(() => {
//     //     verifyToken(token as string);
//     // }, [token]);


//   return (
//     <div>
//       <h1>Verification Page</h1>
//       <p onClick={() => verifyToken(token as string)}>Check to verify your token.</p>
//     </div>
//   );
// }
