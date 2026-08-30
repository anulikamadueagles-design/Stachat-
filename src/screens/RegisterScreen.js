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
        placeholderTextColor="#9BA3AE"
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholderTextColor="#9BA3AE"
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholderTextColor="#9BA3AE"
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
    backgroundColor:"#0D1117"
  },

  title:{
    fontSize:36,
    fontWeight:"bold",
    color:"#00BFA5",
    textAlign:"center"
  },

  subtitle:{
    color: "#E6F7F3",
    textAlign:"center",
    fontSize:20,
    marginBottom:30
  },

  input:{
    color: "#E6F7F3",
    backgroundColor:"#12181C",
    padding:15,
    borderRadius:10,
    marginBottom:15
  },

  button:{
    backgroundColor:"#00BFA5",
    padding:15,
    borderRadius:10,
    alignItems:"center"
  },

  buttonText:{
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:16
  },

  link:{
    textAlign:"center",
    marginTop:20,
    color:"#00BFA5",
    fontWeight:"600"
  }

});



