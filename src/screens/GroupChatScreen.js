import React,{useState,useEffect,useContext} from "react";
import {
View,
FlatList,
TextInput,
TouchableOpacity,
Text,
StyleSheet
} from "react-native";

import {
collection,
addDoc,
query,
orderBy,
onSnapshot,
serverTimestamp
} from "firebase/firestore";

import {db} from "../config/firebase";
import {AuthContext} from "../context/AuthContext";
import MessageBubble from "../components/MessageBubble";

export default function GroupChatScreen({route}){

const {user}=useContext(AuthContext);

const {group}=route.params;

const [text,setText]=useState("");
const [messages,setMessages]=useState([]);

useEffect(()=>{

const q=query(
collection(db,"groups",group.id,"messages"),
orderBy("createdAt","asc")
);

const unsubscribe=onSnapshot(q,snapshot=>{

setMessages(
snapshot.docs.map(doc=>({
id:doc.id,
...doc.data()
}))
);

});

return unsubscribe;

},[]);

async function send(){

if(text.trim()==="") return;

await addDoc(

collection(db,"groups",group.id,"messages"),

{

text:text.trim(),

sender:user.displayName,

senderEmail:user.email,

photoURL:user.photoURL||"",

createdAt:serverTimestamp()

}

);

setText("");

}

return(

<View style={styles.container}>

<FlatList
data={messages}
keyExtractor={item=>item.id}
renderItem={({item})=>
<MessageBubble message={item}/>
}
/>

<View style={styles.bottom}>

<TextInput
style={styles.input}
placeholder="Message..."
value={text}
onChangeText={setText}
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

</View>

);

}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#ECE5DD"
},

bottom:{
flexDirection:"row",
padding:10,
backgroundColor:"#fff"
},

input:{
flex:1,
backgroundColor:"#eee",
borderRadius:20,
paddingHorizontal:15
},

button:{
backgroundColor:"#075E54",
marginLeft:10,
paddingHorizontal:20,
justifyContent:"center",
borderRadius:20
},

send:{
color:"#fff",
fontWeight:"bold"
}

});
