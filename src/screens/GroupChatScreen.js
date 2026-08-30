import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  onSnapshot as onDocSnapshot,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { AuthContext } from "../context/AuthContext";
import MessageBubble from "../components/MessageBubble";
import GroupInfoSheet from "../components/GroupInfoSheet";
import {
  getMyPrivateKey,
  getPublicKeyForUser,
  encryptGroupText,
  decryptGroupText,
} from "../services/EncryptionService";

export default function GroupChatScreen({ route, navigation }) {

  const { user } = useContext(AuthContext);
  const { group: initialGroup } = route.params;

  const [group, setGroup] = useState(initialGroup);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [infoVisible, setInfoVisible] = useState(false);
  const listRef = useRef(null);
  const publicKeyCacheRef = useRef({});

  async function getCachedPublicKey(uid) {
    if (publicKeyCacheRef.current[uid]) return publicKeyCacheRef.current[uid];
    const key = await getPublicKeyForUser(uid);
    publicKeyCacheRef.current[uid] = key;
    return key;
  }

  useEffect(() => {

    const q = query(
      collection(db, "groups", group.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, async snapshot => {

      const raw = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const myPrivateKey = await getMyPrivateKey(user.uid);

      const decrypted = await Promise.all(raw.map(async (message) => {

        if (!message.encrypted) return message;

        if (!myPrivateKey) {
          return { ...message, text: "🔒 Waiting for encryption keys..." };
        }

        const senderPublicKey = await getCachedPublicKey(message.senderUid);

        if (!senderPublicKey) {
          return { ...message, text: "🔒 Unable to decrypt this message" };
        }

        const plainText = decryptGroupText(message, user.uid, myPrivateKey, senderPublicKey);

        return {
          ...message,
          text: plainText ?? "🔒 Unable to decrypt this message",
        };

      }));

      setMessages(decrypted);

    });

    return unsubscribe;

  }, [group.id]);

  useEffect(() => {

    // Keep the header/member list live if the owner renames the group
    // or membership changes while this screen is open.
    const unsubscribe = onDocSnapshot(
      doc(db, "groups", group.id),
      snapshot => {
        if (snapshot.exists()) {
          setGroup({ id: snapshot.id, ...snapshot.data() });
        }
      }
    );

    return unsubscribe;

  }, [group.id]);

  async function send() {

    const plainText = text.trim();
    if (plainText === "") return;

    setText("");

    // Fetch every member's public key (not yet cached ones only) so
    // we can wrap the per-message symmetric key for each of them. As
    // noted in EncryptionService.js, this scales linearly with group
    // size — fine for normal-sized groups, not for huge ones.
    const memberUids = group.members || [];

    const memberPublicKeys = {};
    await Promise.all(memberUids.map(async (uid) => {
      memberPublicKeys[uid] = await getCachedPublicKey(uid);
    }));

    const myPrivateKey = await getMyPrivateKey(user.uid);

    let payload = {
      text: plainText,
      encrypted: false,
    };

    if (myPrivateKey) {
      const hasAnyRecipientKey = Object.values(memberPublicKeys).some(Boolean);

      if (hasAnyRecipientKey) {
        const enc = encryptGroupText(plainText, memberPublicKeys, user.uid, myPrivateKey);
        payload = {
          text: "",
          encrypted: true,
          cipherText: enc.cipherText,
          contentNonce: enc.contentNonce,
          wrappedKeys: enc.wrappedKeys,
        };
      }
    }

    await addDoc(

      collection(db, "groups", group.id, "messages"),

      {
        ...payload,
        senderUid: user.uid,
        senderName: user.displayName || user.email,
        senderEmail: user.email,
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp()
      }

    );

  }

  function renderItem({ item }) {
    return (
      <MessageBubble
        message={{
          ...item,
          mine: item.senderUid === user.uid,
        }}
      />
    );
  }

  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >

      <TouchableOpacity
        style={styles.header}
        onPress={() => setInfoVisible(true)}
      >
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>{group.name}</Text>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {group.members?.length || 0} members · tap for info
        </Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.bottom}>

        <TextInput
        placeholderTextColor="#9BA3AE"
          style={styles.input}
          placeholder="Message..."
          value={text}
          onChangeText={setText}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={send}
        >

          <Text style={styles.send}>
            Send
          </Text>

        </TouchableOpacity>

      </View>

      <GroupInfoSheet
        visible={infoVisible}
        group={group}
        currentUserUid={user.uid}
        onClose={() => setInfoVisible(false)}
        onAddMember={() => {
          setInfoVisible(false);
          navigation.navigate("Contacts", { addToGroupId: group.id });
        }}
        onLeft={() => {
          setInfoVisible(false);
          navigation.navigate("Groups");
        }}
      />

    </KeyboardAvoidingView>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117"
  },

  header:{
    backgroundColor:"#0D1117",
    paddingHorizontal:15,
    paddingVertical:12
  },

  headerTitle:{
    color:"#E6F7F3",
    fontSize:18,
    fontWeight:"bold"
  },

  headerSubtitle:{
    color:"#d5e8e4",
    fontSize:12,
    marginTop:2
  },

  bottom:{
    flexDirection:"row",
    padding:10,
    backgroundColor:"#12181C",
    alignItems:"center"
  },

  input:{
    color: "#E6F7F3",
    flex:1,
    backgroundColor:"#1C2128",
    borderRadius:20,
    paddingHorizontal:15,
    minHeight:45,
    maxHeight:120
  },

  button:{
    backgroundColor:"#00E676",
    marginLeft:10,
    paddingHorizontal:20,
    paddingVertical:10,
    justifyContent:"center",
    borderRadius:20
  },

  send:{
    color:"#E6F7F3",
    fontWeight:"bold"
  }

});
