import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

import { AuthContext } from "../context/AuthContext";
import { exportBackup, restoreBackup } from "../services/BackupService";
import {
  exportPrivateKeyForBackup,
  importPrivateKeyFromBackup,
} from "../services/EncryptionService";

const LAST_BACKUP_KEY = "stachat:lastBackupAt";

export default function BackupScreen() {

  const { user } = useContext(AuthContext);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [lastBackupAt, setLastBackupAt] = useState(null);
  const [keyBusy, setKeyBusy] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LAST_BACKUP_KEY).then((value) => {
      if (value) setLastBackupAt(parseInt(value, 10));
    });
  }, []);

  async function handleBackup() {

    if (busy) return;
    setBusy(true);
    setStatus("Starting...");

    try {

      const result = await exportBackup(user, setStatus);

      await AsyncStorage.setItem(LAST_BACKUP_KEY, String(Date.now()));
      setLastBackupAt(Date.now());

      Alert.alert(
        "Backup complete",
        `Saved ${result.chatCount} chat(s), ${result.groupCount} group(s), ` +
          `${result.messageCount} message(s).`
      );

    } catch (error) {

      console.log("Backup failed:", error);
      Alert.alert("Backup failed", "Please try again.");

    } finally {

      setBusy(false);
      setStatus("");

    }

  }

  async function handleRestore() {

    if (busy) return;

    Alert.alert(
      "Restore from backup?",
      "This will restore chats and groups from a backup file into your account. Existing data won't be deleted, but matching items may be overwritten with the backup's version.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Choose File", onPress: doRestore },
      ]
    );

  }

  async function doRestore() {

    setBusy(true);
    setStatus("Starting...");

    try {

      const result = await restoreBackup(setStatus);

      if (!result) {
        setBusy(false);
        setStatus("");
        return;
      }

      Alert.alert(
        "Restore complete",
        `Restored ${result.chatCount} chat(s) and ${result.groupCount} group(s).`
      );

    } catch (error) {

      console.log("Restore failed:", error);
      Alert.alert(
        "Restore failed",
        error.message || "Please make sure you selected a valid STAChat backup file."
      );

    } finally {

      setBusy(false);
      setStatus("");

    }

  }

  async function handleExportKey() {

    if (keyBusy) return;
    setKeyBusy(true);

    try {

      const keyJson = await exportPrivateKeyForBackup(user.uid);

      if (!keyJson) {
        Alert.alert("No key found", "Encryption isn't set up on this device yet.");
        return;
      }

      const fileUri = FileSystem.documentDirectory + `stachat-encryption-key-${user.uid}.json`;
      await FileSystem.writeAsStringAsync(fileUri, keyJson);

      Alert.alert(
        "Keep this safe",
        "This file lets whoever has it read your encrypted messages. Store it somewhere private — not a shared drive or public chat.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
              }
            },
          },
        ]
      );

    } catch (error) {

      console.log("Key export failed:", error);
      Alert.alert("Export failed", "Please try again.");

    } finally {

      setKeyBusy(false);

    }

  }

  async function handleImportKey() {

    if (keyBusy) return;

    Alert.alert(
      "Import encryption key?",
      "This replaces the encryption key on this device. Only do this with a key you exported from your own account — importing the wrong key means you won't be able to read your messages.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Choose File", onPress: doImportKey },
      ]
    );

  }

  async function doImportKey() {

    setKeyBusy(true);

    try {

      const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });

      if (result.canceled) {
        setKeyBusy(false);
        return;
      }

      const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
      await importPrivateKeyFromBackup(user.uid, raw);

      Alert.alert("Key imported", "You should now be able to read messages encrypted with this key.");

    } catch (error) {

      console.log("Key import failed:", error);
      Alert.alert("Import failed", error.message || "Please make sure you selected a valid key file.");

    } finally {

      setKeyBusy(false);

    }

  }

  return (

    <View style={styles.container}>

      <Text style={styles.heading}>Chat Backup</Text>

      <Text style={styles.description}>
        Back up your chats and groups to a file you can save to Drive,
        email to yourself, or store anywhere you like. Media (photos,
        videos, voice notes, documents) is backed up as links, so keep
        the app's Firebase Storage intact for those to keep working.
      </Text>

      {lastBackupAt ? (
        <Text style={styles.lastBackup}>
          Last backup: {new Date(lastBackupAt).toLocaleString()}
        </Text>
      ) : (
        <Text style={styles.lastBackup}>No backup yet on this device</Text>
      )}

      {busy ? (
        <View style={styles.statusBox}>
          <ActivityIndicator color="#00BFA5" />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, styles.backupButton, busy && styles.buttonDisabled]}
        onPress={handleBackup}
        disabled={busy}
      >
        <Text style={styles.buttonText}>Backup Now</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.restoreButton, busy && styles.buttonDisabled]}
        onPress={handleRestore}
        disabled={busy}
      >
        <Text style={styles.buttonText}>Restore from Backup</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Note: this is manual, on-demand backup — there's no automatic
        scheduled backup yet. Run it whenever you want a fresh copy.
      </Text>

      <View style={styles.divider} />

      <Text style={styles.heading}>Encryption Key</Text>

      <Text style={styles.description}>
        Your messages are end-to-end encrypted using a key stored only
        on this device — it's never sent to our servers. If you switch
        phones or reinstall the app without exporting this key first,
        you will permanently lose the ability to read your old
        messages. There is no way for anyone, including us, to recover
        it for you.
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.backupButton, keyBusy && styles.buttonDisabled]}
        onPress={handleExportKey}
        disabled={keyBusy}
      >
        <Text style={styles.buttonText}>Export Encryption Key</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.restoreButton, keyBusy && styles.buttonDisabled]}
        onPress={handleImportKey}
        disabled={keyBusy}
      >
        <Text style={styles.buttonText}>Import Encryption Key</Text>
      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117",
    padding:20
  },

  heading:{
    fontSize:20,
    fontWeight:"bold",
    color:"#00BFA5",
    marginBottom:10
  },

  description:{
    color:"#9BA3AE",
    fontSize:14,
    lineHeight:20,
    marginBottom:15
  },

  lastBackup:{
    color:"#9BA3AE",
    fontSize:13,
    marginBottom:20
  },

  statusBox:{
    flexDirection:"row",
    alignItems:"center",
    marginBottom:15
  },

  statusText:{
    marginLeft:10,
    color:"#9BA3AE"
  },

  button:{
    padding:16,
    borderRadius:12,
    alignItems:"center",
    marginBottom:12
  },

  backupButton:{
    backgroundColor:"#00E676"
  },

  restoreButton:{
    backgroundColor:"#00BFA5"
  },

  buttonDisabled:{
    opacity:0.6
  },

  buttonText:{
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:16
  },

  note:{
    color:"#9BA3AE",
    fontSize:12,
    marginTop:10,
    lineHeight:18
  },

  divider:{
    height:1,
    backgroundColor:"#1C2128",
    marginVertical:25
  }

});
