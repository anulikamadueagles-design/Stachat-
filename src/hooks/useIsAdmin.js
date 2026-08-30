import { useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "../config/firebase";
import { AuthContext } from "../context/AuthContext";

// Reads users/{uid}.isAdmin. There's no in-app way to grant this to
// yourself (that would be a security hole) — set it to `true` for
// your own account directly in the Firebase console:
// Firestore > users > <your uid> > isAdmin: true
export default function useIsAdmin() {
  const { user } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setIsAdmin(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      setIsAdmin(!!snapshot.data()?.isAdmin);
    });

    return unsubscribe;
  }, [user?.uid]);

  return isAdmin;
}
