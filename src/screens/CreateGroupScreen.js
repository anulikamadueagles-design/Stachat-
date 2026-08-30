import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { AuthContext } from "../context/AuthContext";
import { getUsers } from "../services/UserService";
import { createGroup } from "../groupchat/GroupService";

export default function CreateGroupScreen({ navigation }) {

  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {

    getUsers().then(list =>
      setUsers(list.filter(u => u.uid !== user.uid))
    );

  }, []);

  function toggle(uid) {
    setSelected(prev =>
      prev.includes(uid)
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    );
  }

  async function handleCreate() {

    const trimmed = name.trim();

    if (!trimmed || selected.length === 0 || creating) return;

    setCreating(true);

    try {

      const groupRef = await createGroup(
        trimmed,
        [user.uid, ...selected],
        user.uid
      );

      navigation.replace("GroupChat", {
        group: {
          id: groupRef.id,
          name: trimmed,
          owner: user.uid,
          members: [user.uid, ...selected],
        }
      });

    } catch (error) {

      console.log("Failed to create group:", error);

    } finally {

      setCreating(false);

    }

  }

  return (

    <View style={styles.container}>

      <TextInput
        placeholderTextColor="#9BA3AE"
        style={styles.nameInput}
        placeholder="Group name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.sectionLabel}>
        Select members ({selected.length} selected)
      </Text>

      <FlatList
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={12}
        data={users}
        keyExtractor={item => item.uid}
        renderItem={({ item }) => {

          const isSelected = selected.includes(item.uid);

          return (

            <TouchableOpacity
              style={styles.row}
              onPress={() => toggle(item.uid)}
            >

              <View>
                <Text style={styles.name}>{item.displayName}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>

              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected
                ]}
              >
                {isSelected ? <Text style={styles.check}>✓</Text> : null}
              </View>

            </TouchableOpacity>

          );

        }}
      />

      <TouchableOpacity
        style={[
          styles.createButton,
          (!name.trim() || selected.length === 0 || creating) &&
            styles.createButtonDisabled
        ]}
        onPress={handleCreate}
        disabled={!name.trim() || selected.length === 0 || creating}
      >
        <Text style={styles.createButtonText}>
          {creating ? "Creating..." : "Create Group"}
        </Text>
      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0D1117"
  },

  nameInput:{
    color: "#E6F7F3",
    backgroundColor:"#12181C",
    margin:15,
    marginBottom:5,
    padding:12,
    borderRadius:10,
    fontSize:16
  },

  sectionLabel:{
    marginHorizontal:15,
    marginTop:10,
    marginBottom:5,
    color:"#9BA3AE",
    fontSize:13
  },

  row:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    backgroundColor:"#12181C",
    marginHorizontal:15,
    marginVertical:4,
    padding:12,
    borderRadius:10
  },

  name:{
    color: "#E6F7F3",
    fontSize:16,
    fontWeight:"600"
  },

  email:{
    fontSize:12,
    color:"#9BA3AE",
    marginTop:2
  },

  checkbox:{
    width:24,
    height:24,
    borderRadius:12,
    borderWidth:2,
    borderColor:"#00BFA5",
    justifyContent:"center",
    alignItems:"center"
  },

  checkboxSelected:{
    backgroundColor:"#0D1117"
  },

  check:{
    color:"#E6F7F3",
    fontWeight:"bold"
  },

  createButton:{
    backgroundColor:"#00E676",
    margin:15,
    padding:15,
    borderRadius:12,
    alignItems:"center"
  },

  createButtonDisabled:{
    opacity:0.5
  },

  createButtonText:{
    color:"#E6F7F3",
    fontWeight:"bold",
    fontSize:16
  }

});
