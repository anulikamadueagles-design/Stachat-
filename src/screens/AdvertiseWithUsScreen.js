import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

import { PRICE_TIERS } from "../services/PaymentService";

export default function AdvertiseWithUsScreen({ navigation }) {

  return (

    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.heading}>Advertise on STAChat</Text>

      <Text style={styles.intro}>
        Reach STAChat users with a sponsored placement in the chat list,
        status updates, a banner, or a full-screen promotion.
      </Text>

      {Object.entries(PRICE_TIERS).map(([key, tier]) => (
        <View key={key} style={styles.tierCard}>
          <Text style={styles.tierLabel}>{tier.label}</Text>
          <Text style={styles.tierPrice}>
            ${tier.amount} {tier.currency} / {tier.per}
          </Text>
        </View>
      ))}

      <Text style={styles.note}>
        After you submit a request, you'll be guided to complete payment.
        Your ad goes live once payment is confirmed.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateAd")}
      >
        <Text style={styles.buttonText}>Request an Ad Slot</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("MyAds")}
      >
        <Text style={styles.secondaryButtonText}>View My Ads</Text>
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
    fontSize:22,
    fontWeight:"bold",
    color:"#00BFA5",
    marginBottom:10
  },

  intro:{
    color:"#9BA3AE",
    fontSize:14,
    marginBottom:20,
    lineHeight:20
  },

  tierCard:{
    backgroundColor:"#12181C",
    borderRadius:10,
    padding:15,
    marginBottom:10,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  },

  tierLabel:{
    color: "#E6F7F3",
    fontSize:15,
    fontWeight:"600",
    flex:1
  },

  tierPrice:{
    fontSize:14,
    color:"#00BFA5",
    fontWeight:"bold"
  },

  note:{
    color:"#9BA3AE",
    fontSize:12,
    marginTop:15,
    marginBottom:20,
    lineHeight:18
  },

  button:{
    backgroundColor:"#00E676",
    padding:16,
    borderRadius:12,
    alignItems:"center"
  },

  buttonText:{
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:16
  },

  secondaryButton:{
    marginTop:12,
    padding:16,
    borderRadius:12,
    alignItems:"center",
    borderWidth:1,
    borderColor:"#00BFA5"
  },

  secondaryButtonText:{
    color:"#00BFA5",
    fontWeight:"bold",
    fontSize:16
  }

});
