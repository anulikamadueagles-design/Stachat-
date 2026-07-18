import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";

import { AuthContext } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {

  const { register } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await register(
        name.trim(),
        email.trim(),
        password
      );
    } finally {
      setLoading(false);
    }

  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        STAChat
      </Text>

      <Text style={styles.subtitle}>
        Create Account
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >

        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Register
          </Text>
        )}

      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
      >

        <Text style={styles.link}>
          Already have an account? Login
        </Text>

      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    justifyContent:"center",
    padding:25,
    backgroundColor:"#ECE5DD"
  },

  title:{
    fontSize:36,
    fontWeight:"bold",
    color:"#075E54",
    textAlign:"center"
  },

  subtitle:{
    textAlign:"center",
    fontSize:20,
    marginBottom:30
  },

  input:{
    backgroundColor:"#fff",
    padding:15,
    borderRadius:10,
    marginBottom:15
  },

  button:{
    backgroundColor:"#128C7E",
    padding:15,
    borderRadius:10,
    alignItems:"center"
  },

  buttonText:{
    color:"#fff",
    fontWeight:"bold",
    fontSize:16
  },

  link:{
    textAlign:"center",
    marginTop:20,
    color:"#075E54",
    fontWeight:"600"
  }

});



