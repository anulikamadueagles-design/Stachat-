import { useEffect, useContext } from "react";
import { AppState } from "react-native";

import { AuthContext } from "../context/AuthContext";

import {
  goOnline as setOnline,
  goOffline as setOffline
} from "../status/OnlineStatus";

export default function useOnlineStatus() {

  const { user } = useContext(AuthContext);

  useEffect(() => {

    if (!user) return;

    setOnline(user.uid);

    const subscription =
      AppState.addEventListener(
        "change",
        (state) => {

          if (state === "active") {
            setOnline(user.uid);
          } else {
            setOffline(user.uid);
          }

        }
      );

    return () => {

      subscription.remove();

      setOffline(user.uid);

    };

  }, [user]);

}
