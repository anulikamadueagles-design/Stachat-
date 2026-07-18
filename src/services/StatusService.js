import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import { db, storage } from "../config/firebase";

export async function uploadStatus(user, file) {

  const response = await fetch(file.uri);
  const blob = await response.blob();

  const storageRef = ref(
    storage,
    `status/${user.uid}/${Date.now()}`
  );

  await uploadBytes(storageRef, blob);

  const mediaUrl = await getDownloadURL(storageRef);

  await addDoc(
    collection(db, "status"),
    {
      uid: user.uid,
      name: user.displayName || user.email,
      mediaUrl,
      createdAt: serverTimestamp()
    }
  );

}

export function subscribeStatus(callback) {

  const q = query(
    collection(db, "status"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, snapshot => {

    callback(
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    );

  });

}
import React,{
useEffect,
useState
} from "react";

import{
View,
FlatList,
TouchableOpacity,
Image,
Text,
StyleSheet
} from "react-native";

import{
subscribeStatus
} from "../services/StatusService";

export default function StatusScreen({navigation}){

const[status,setStatus]=useState([]);

useEffect(()=>{

return subscribeStatus(setStatus);

},[]);

return(

<View style={styles.container}>

<FlatList

data={status}

keyExtractor={item=>item.id}

renderItem={({item})=>(

<TouchableOpacity

style={styles.card}

onPress={()=>navigation.navigate(
"StatusViewer",
{status:item}
)}

>

<Image

source={{uri:item.mediaUrl}}

style={styles.image}

/>

<Text style={styles.name}>
{item.name}
</Text>

</TouchableOpacity>

)}

/>

</View>

);

}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#ECE5DD"
},

card:{
flexDirection:"row",
alignItems:"center",
padding:12,
backgroundColor:"#fff",
margin:8,
borderRadius:10
},

image:{
width:60,
height:60,
borderRadius:30,
marginRight:15
},

name:{
fontWeight:"bold",
fontSize:16
}

});
