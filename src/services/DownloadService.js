import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export async function downloadFile(url, fileName) {

  try {

    const path =
      FileSystem.documentDirectory +
      fileName;

    const result =
      await FileSystem.downloadAsync(
        url,
        path
      );

    if (await Sharing.isAvailableAsync()) {

      await Sharing.shareAsync(
        result.uri
      );

    }

    return result.uri;

  } catch (error) {

    console.log(error);

    return null;

  }

}
