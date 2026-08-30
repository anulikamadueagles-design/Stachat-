import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Easing,
} from "react-native";

import * as SplashScreen from "expo-splash-screen";
import { AuthContext } from "../context/AuthContext";

// Keep the native splash (app.json's expo-splash-screen config) up
// until this file explicitly hides it, so there is never a gap where
// nothing is drawn on screen.
SplashScreen.preventAutoHideAsync().catch(() => {});

const MIN_DISPLAY_MS = 1600;

export default function AnimatedSplashScreen({ children }) {

  const { loading: authLoading } = useContext(AuthContext);

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [nativeHidden, setNativeHidden] = useState(false);

  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    // Hide the native (static) splash as soon as we've rendered our
    // first frame, then run our own animation on top — this is what
    // avoids the blank white flash between "native splash disappears"
    // and "JS has something to show".
    (async () => {
      await SplashScreen.hideAsync().catch(() => {});
      setNativeHidden(true);
    })();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);

  }, []);

  const ready = nativeHidden && minTimeElapsed && !authLoading;

  if (!ready) {
    return (
      <View style={styles.container}>

        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <Image
            source={require("../../assets/adaptive-icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity, alignItems: "center" }}>
          <Text style={styles.wordmark}>
            <Text style={styles.wordmarkAccent}>STA</Text>
            <Text style={styles.wordmarkRest}>Chat</Text>
          </Text>
          <Text style={styles.tagline}>Secure. Fast. Yours.</Text>
        </Animated.View>

        <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
          <PulsingDot delay={0} />
          <PulsingDot delay={150} />
          <PulsingDot delay={300} />
        </Animated.View>

        <Animated.Text style={[styles.credit, { opacity: dotsOpacity }]}>
          Created by David Kamsi Elvis · Element Tech
        </Animated.Text>

      </View>
    );
  }

  return children;

}

function PulsingDot({ delay }) {

  const value = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: 450,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0.3,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();

  }, []);

  return (
    <Animated.View style={[styles.dot, { opacity: value }]} />
  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117",
    justifyContent:"center",
    alignItems:"center"
  },

  logoImage:{
    width:150,
    height:150
  },

  wordmark:{
    marginTop:22,
    fontSize:30,
    fontWeight:"bold",
    letterSpacing:0.5
  },

  wordmarkAccent:{
    color:"#00E676"
  },

  wordmarkRest:{
    color:"#E6F7F3"
  },

  tagline:{
    marginTop:6,
    fontSize:13,
    color:"#00BFA5",
    letterSpacing:1,
    fontWeight:"600"
  },

  dotsRow:{
    flexDirection:"row",
    marginTop:30
  },

  dot:{
    width:8,
    height:8,
    borderRadius:4,
    backgroundColor:"#00E676",
    marginHorizontal:4
  },

  credit:{
    position:"absolute",
    bottom:40,
    color:"#9BA3AE",
    fontSize:11,
    letterSpacing:0.3
  }

});
