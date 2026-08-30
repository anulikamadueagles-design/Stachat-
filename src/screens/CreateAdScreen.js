import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

import { AuthContext } from "../context/AuthContext";
import { pickImage, uploadImage } from "../services/MediaService";
import {
  AD_PLACEMENTS,
  submitAdRequest,
  createHouseAd,
  updateAdContent,
} from "../services/AdService";
import { PRICE_TIERS, openPaymentFlow } from "../services/PaymentService";

const PLACEMENT_OPTIONS = [
  { value: AD_PLACEMENTS.CHAT_LIST, label: "Sponsored chat list post" },
  { value: AD_PLACEMENTS.STATUS, label: "Sponsored status" },
  { value: AD_PLACEMENTS.CHANNEL, label: "Sponsored channel" },
  { value: AD_PLACEMENTS.BANNER, label: "Banner ad" },
  { value: AD_PLACEMENTS.FULLSCREEN, label: "Full-screen ad" },
];

export default function CreateAdScreen({ route, navigation }) {

  const { user } = useContext(AuthContext);
  const isAdminMode = route?.params?.mode === "admin";
  const editingAd = route?.params?.editingAd || null;

  const [businessName, setBusinessName] = useState(editingAd?.businessName || "");
  const [contactEmail, setContactEmail] = useState(editingAd?.contactEmail || "");
  const [title, setTitle] = useState(editingAd?.title || "");
  const [description, setDescription] = useState(editingAd?.description || "");
  const [linkUrl, setLinkUrl] = useState(editingAd?.linkUrl || "");
  const [placement, setPlacement] = useState(editingAd?.placement || AD_PLACEMENTS.CHAT_LIST);
  const [days, setDays] = useState("7");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const priceInfo = PRICE_TIERS[placement];
  const numDays = Math.max(1, parseInt(days, 10) || 1);
  const totalPrice = priceInfo ? priceInfo.amount * numDays : 0;

  async function handlePickImage() {
    const asset = await pickImage();
    if (asset) setImage(asset);
  }

  function validate() {
    if (!businessName.trim() || !title.trim() || !linkUrl.trim()) {
      Alert.alert(
        "Missing info",
        "Business name, ad title, and link URL are required."
      );
      return false;
    }
    return true;
  }

  async function handleSubmit() {

    if (!validate() || submitting) return;

    setSubmitting(true);

    try {

      let imageUrl = null;

      if (image) {
        imageUrl = await uploadImage(image, user.uid);
      }

      const scheduleStart = Date.now();
      const scheduleEnd = Date.now() + numDays * 24 * 60 * 60 * 1000;

      const payload = {
        businessName: businessName.trim(),
        contactEmail: contactEmail.trim(),
        title: title.trim(),
        description: description.trim(),
        imageUrl,
        linkUrl: linkUrl.trim(),
        placement,
        scheduleStart,
        scheduleEnd,
        priceTier: placement,
        amount: totalPrice,
        currency: priceInfo?.currency || "USD",
        createdBy: user.uid,
      };

      if (editingAd) {

        // Editing an existing ad: keep its current image unless a new
        // one was picked, and don't touch its status/payment fields.
        const editPayload = { ...payload };
        if (!image) delete editPayload.imageUrl;

        await updateAdContent(editingAd.id, editPayload);

        Alert.alert("Ad updated", "Your changes have been saved.");
        navigation.goBack();

      } else if (isAdminMode) {

        await createHouseAd(payload);

        Alert.alert("Ad created", "Your house ad is live now.");
        navigation.goBack();

      } else {

        const ref = await submitAdRequest(payload);

        Alert.alert(
          "Request submitted",
          "Next you'll be sent to complete payment. Your ad goes live once payment is confirmed."
        );

        await openPaymentFlow({ id: ref.id, ...payload });

        navigation.goBack();

      }

    } catch (error) {

      console.log("Failed to submit ad:", error);
      Alert.alert("Something went wrong", "Please try again.");

    } finally {

      setSubmitting(false);

    }

  }

  return (

    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.heading}>
        {editingAd ? "Edit Ad" : isAdminMode ? "Create House Ad" : "Request an Ad"}
      </Text>

      <Text style={styles.label}>Business name</Text>
      <TextInput
        placeholderTextColor="#9BA3AE"
        style={styles.input}
        value={businessName}
        onChangeText={setBusinessName}
        placeholder="e.g. Ada's Bakery"
      />

      <Text style={styles.label}>Contact email</Text>
      <TextInput
        placeholderTextColor="#9BA3AE"
        style={styles.input}
        value={contactEmail}
        onChangeText={setContactEmail}
        placeholder="you@business.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Ad title</Text>
      <TextInput
        placeholderTextColor="#9BA3AE"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Short, punchy headline"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        placeholderTextColor="#9BA3AE"
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="A sentence or two"
        multiline
      />

      <Text style={styles.label}>Destination link</Text>
      <TextInput
        placeholderTextColor="#9BA3AE"
        style={styles.input}
        value={linkUrl}
        onChangeText={setLinkUrl}
        placeholder="https://..."
        autoCapitalize="none"
        keyboardType="url"
      />

      <Text style={styles.label}>Ad image</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePickerText}>Tap to choose an image</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Placement</Text>
      <View style={styles.placementRow}>
        {PLACEMENT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.placementChip,
              placement === option.value && styles.placementChipSelected,
            ]}
            onPress={() => setPlacement(option.value)}
          >
            <Text
              style={[
                styles.placementChipText,
                placement === option.value && styles.placementChipTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Run for how many days?</Text>
      <TextInput
        placeholderTextColor="#9BA3AE"
        style={styles.input}
        value={days}
        onChangeText={setDays}
        keyboardType="number-pad"
      />

      {!isAdminMode && !editingAd && priceInfo ? (
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>
            {priceInfo.label} · ${priceInfo.amount}/{priceInfo.per}
          </Text>
          <Text style={styles.priceTotal}>
            Total: ${totalPrice} {priceInfo.currency}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting
            ? "Saving..."
            : editingAd
            ? "Save Changes"
            : isAdminMode
            ? "Create House Ad"
            : "Submit & Continue to Payment"}
        </Text>
      </TouchableOpacity>

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117"
  },

  content:{
    padding:20,
    paddingBottom:60
  },

  heading:{
    fontSize:20,
    fontWeight:"bold",
    marginBottom:15,
    color:"#00BFA5"
  },

  label:{
    fontSize:13,
    color:"#9BA3AE",
    marginTop:14,
    marginBottom:5
  },

  input:{
    color: "#E6F7F3",
    backgroundColor:"#12181C",
    borderRadius:10,
    paddingHorizontal:15,
    paddingVertical:12,
    fontSize:15
  },

  multiline:{
    minHeight:70,
    textAlignVertical:"top"
  },

  imagePicker:{
    backgroundColor:"#12181C",
    borderRadius:10,
    height:150,
    justifyContent:"center",
    alignItems:"center",
    overflow:"hidden"
  },

  imagePickerText:{
    color:"#9BA3AE"
  },

  imagePreview:{
    width:"100%",
    height:"100%"
  },

  placementRow:{
    flexDirection:"row",
    flexWrap:"wrap"
  },

  placementChip:{
    backgroundColor:"#12181C",
    paddingHorizontal:12,
    paddingVertical:8,
    borderRadius:20,
    marginRight:8,
    marginBottom:8
  },

  placementChipSelected:{
    backgroundColor:"#0D1117"
  },

  placementChipText:{
    fontSize:13,
    color:"#E6F7F3"
  },

  placementChipTextSelected:{
    color:"#E6F7F3",
    fontWeight:"bold"
  },

  priceBox:{
    backgroundColor:"#12181C",
    borderRadius:10,
    padding:15,
    marginTop:15
  },

  priceLabel:{
    color:"#9BA3AE",
    fontSize:13
  },

  priceTotal:{
    fontSize:18,
    fontWeight:"bold",
    color:"#00BFA5",
    marginTop:4
  },

  submitButton:{
    backgroundColor:"#00E676",
    padding:16,
    borderRadius:12,
    alignItems:"center",
    marginTop:25
  },

  submitButtonDisabled:{
    opacity:0.6
  },

  submitButtonText:{
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:16
  }

});
