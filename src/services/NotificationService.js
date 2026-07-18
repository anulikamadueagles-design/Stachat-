import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export async function requestNotificationPermission() {

  const { status } =
    await Notifications.requestPermissionsAsync();

  return status === "granted";

}

export async function getPushToken() {

  const token =
    await Notifications.getExpoPushTokenAsync();

  return token.data;

}

export async function showLocalNotification(
  title,
  body
) {

  await Notifications.scheduleNotificationAsync({

    content: {
      title,
      body
    },

    trigger: null

  });

}
