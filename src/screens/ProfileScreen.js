import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import { AuthContext } from "../context/AuthContext";
import { pickImage } from "../services/MediaService";
import {
  updateProfile,
  uploadProfilePhoto,
} from "../services/ProfileService";
import { deleteAccount } from "../services/AccountService";

export default function ProfileScreen() {

  const { user } = useContext(AuthContext);

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleChangePhoto() {

    const asset = await pickImage();

    if (!asset) return;

    setUploadingPhoto(true);

    try {

      const url = await uploadProfilePhoto(user.uid, asset);
      await updateProfile(user.uid, { photoURL: url });
      setPhotoURL(url);

    } catch (error) {

      console.log("Failed to update photo:", error);

    } finally {

      setUploadingPhoto(false);

    }

  }

  async function handleSave() {

    setSaving(true);

    try {

      await updateProfile(user.uid, {
        displayName: displayName.trim(),
        bio: bio.trim(),
      });

    } catch (error) {

      console.log("Failed to save profile:", error);

    } finally {

      setSaving(false);

    }

  }

  async function handleDeleteAccount() {

    if (!deletePassword || deleting) return;

    setDeleting(true);

    try {

      await deleteAccount(user, deletePassword);
      // No need to navigate away manually — AuthContext's
      // onAuthStateChanged listener will detect the sign-out and
      // AppNavigator will switch back to the Login stack on its own.

    } catch (error) {

      console.log("Failed to delete account:", error);

      Alert.alert(
        "Couldn't delete account",
        error.code === "auth/wrong-password" || error.code === "auth/invalid-credential"
          ? "That password doesn't match your account."
          : "Please try again."
      );

    } finally {

      setDeleting(false);

    }

  }

  return (

    <View style={styles.container}>

      <TouchableOpacity
        style={styles.avatarWrap}
        onPress={handleChangePhoto}
      >

        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {(displayName || user?.email || "?")[0].toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.avatarBadge}>
          {uploadingPhoto ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.avatarBadgeText}>✏️</Text>
          )}
        </View>

      </TouchableOpacity>

      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholderTextColor="#9BA3AE"
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        placeholderTextColor="#9BA3AE"
        style={[styles.input, styles.bioInput]}
        value={bio}
        onChangeText={setBio}
        placeholder="About you"
        multiline
      />

      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>

      <View style={styles.dangerZone}>

        {!showDeleteConfirm ? (
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)}>
            <Text style={styles.deleteLink}>Delete my account</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={styles.deleteWarning}>
              This permanently deletes your account and can't be undone.
              Enter your password to confirm.
            </Text>
            <TextInput
        placeholderTextColor="#9BA3AE"
              style={styles.input}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Password"
              secureTextEntry
            />
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.cancelDeleteButton}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                }}
              >
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmDeleteButton, deleting && styles.saveButtonDisabled]}
                onPress={handleDeleteAccount}
                disabled={deleting || !deletePassword}
              >
                <Text style={styles.confirmDeleteText}>
                  {deleting ? "Deleting..." : "Permanently Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117",
    padding:20,
    alignItems:"center"
  },

  avatarWrap:{
    marginTop:20,
    marginBottom:20
  },

  avatar:{
    width:100,
    height:100,
    borderRadius:50
  },

  avatarPlaceholder:{
    width:100,
    height:100,
    borderRadius:50,
    backgroundColor:"#0D1117",
    justifyContent:"center",
    alignItems:"center"
  },

  avatarInitial:{
    color:"#E6F7F3",
    fontSize:36,
    fontWeight:"bold"
  },

  avatarBadge:{
    position:"absolute",
    bottom:0,
    right:0,
    width:30,
    height:30,
    borderRadius:15,
    backgroundColor:"#00E676",
    justifyContent:"center",
    alignItems:"center",
    borderWidth:2,
    borderColor:"#21262D"
  },

  avatarBadgeText:{
    fontSize:14
  },

  label:{
    alignSelf:"flex-start",
    color:"#9BA3AE",
    fontSize:13,
    marginBottom:5,
    marginTop:10
  },

  input:{
    color: "#E6F7F3",
    width:"100%",
    backgroundColor:"#12181C",
    borderRadius:10,
    paddingHorizontal:15,
    paddingVertical:12,
    fontSize:16
  },

  bioInput:{
    minHeight:70,
    textAlignVertical:"top"
  },

  email:{
    marginTop:15,
    color:"#9BA3AE",
    fontSize:14
  },

  saveButton:{
    marginTop:25,
    backgroundColor:"#00E676",
    paddingVertical:14,
    borderRadius:10,
    width:"100%",
    alignItems:"center"
  },

  saveButtonDisabled:{
    opacity:0.6
  },

  saveButtonText:{
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:16
  },

  dangerZone:{
    marginTop:30,
    width:"100%",
    alignItems:"center"
  },

  deleteLink:{
    color:"#D32F2F",
    fontSize:14
  },

  deleteWarning:{
    color:"#D32F2F",
    fontSize:13,
    marginBottom:10,
    textAlign:"center"
  },

  deleteActions:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginTop:10
  },

  cancelDeleteButton:{
    flex:1,
    marginRight:8,
    paddingVertical:12,
    borderRadius:10,
    alignItems:"center",
    backgroundColor:"#1C2128"
  },

  cancelDeleteText:{
    color:"#E6F7F3",
    fontWeight:"600"
  },

  confirmDeleteButton:{
    flex:1,
    marginLeft:8,
    paddingVertical:12,
    borderRadius:10,
    alignItems:"center",
    backgroundColor:"#D32F2F"
  },

  confirmDeleteText:{
    color:"#E6F7F3",
    fontWeight:"bold"
  }

});
