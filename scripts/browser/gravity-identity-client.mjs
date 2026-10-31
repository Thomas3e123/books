// Generated into /assets/js/gravity-identity-client.js at build time.
// Never place authentication tokens or passwords into generated source.
import {
 signup,login,logout,getUser,handleAuthCallback,
 requestPasswordRecovery,updateUser,acceptInvite
} from '@netlify/identity';
window.GravityCustomerIdentity={
 signup,login,logout,getUser,handleAuthCallback,
 requestPasswordRecovery,updateUser,acceptInvite
};
window.dispatchEvent(new Event('gravity:identity-ready'));
