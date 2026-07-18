import { useEffect, useContext } from "react";
import { AppState } from "react-native";

import { AuthContext } from "../context/AuthContext";

import {
  setOnline,
  setOffline
} from "../status/OnlineStatus";

export default function useOnlineStatus() {

  const { user } = useContext(AuthContext);

  useEffect(() => {

    if (!user) return;

    setOnline(user);

    const subscription =
      AppState.addEventListener(
        "change",
        (state) => {

          if (state === "active") {
            setOnline(user);
          } else {
            setOffline(user);
          }

        }
      );

    return () => {

      subscription.remove();

      setOffline(user);

    };

  }, [user]);

}
