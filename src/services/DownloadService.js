// expo-file-system v19+ moved documentDirectory/downloadAsync/etc to a
// /legacy subpath — importing from the bare package no longer exposes
// them (it's the new File/Directory class API instead), which would
// have made every document open/download silently fail.
import * as FileSystem from "expo-file-system/legacy";
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
