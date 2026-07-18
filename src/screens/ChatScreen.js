import React,{useState,useEffect,useContext} from "react";
import {
View,
FlatList,
TextInput,
TouchableOpacity,
Text,
StyleSheet
} from "react-native";

import { AuthContext } from "../context/AuthContext";
import MessageBubble from "../components/MessageBubble";

import {
subscribeToMessages,
sendMessage
} from "../services/ChatService";

import {
pickImage,
uploadImage
} from "../services/MediaService";

import {
startRecording,
stopRecording
} from "../services/VoiceService";

export default function ChatScreen(){

const {user}=useContext(AuthContext);

const [messages,setMessages]=useState([]);
const [text,setText]=useState("");

useEffect(()=>{

const unsubscribe=
subscribeToMessages(setMessages);

return unsubscribe;

},[]);

async function sendText(){

if(text.trim()==="") return;

await sendMessage(text,user);

setText("");

}

async function sendImage(){

const image=await pickImage();

if(!image) return;

const url=await uploadImage(image);

await sendMessage("[Image] "+url,user);

}

async function recordVoice(){

await startRecording();

alert("Recording started");

}

async function stopVoice(){

const uri=await stopRecording();

if(!uri) return;

await sendMessage("[Voice] "+uri,user);

}

return(

<View style={styles.container}>

<FlatList
data={messages}
keyExtractor={(item)=>item.id}
renderItem={({item})=>
<MessageBubble message={item}/>
}
/>

<View style={styles.bottom}>

<TouchableOpacity
onPress={sendImage}
style={styles.iconButton}
>

<Text style={styles.icon}>
📷
</Text>

</TouchableOpacity>

<TouchableOpacity
onPress={recordVoice}
onLongPress={stopVoice}
style={styles.iconButton}
>

<Text style={styles.icon}>
🎤
</Text>

</TouchableOpacity>

<TextInput
style={styles.input}
placeholder="Message..."
value={text}
onChangeText={setText}
/>

<TouchableOpacity
style={styles.sendButton}
onPress={sendText}
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
alignItems:"center",
padding:10,
backgroundColor:"#fff"
},

iconButton:{
padding:8
},

icon:{
fontSize:22
},

input:{
flex:1,
backgroundColor:"#eee",
borderRadius:20,
paddingHorizontal:15,
marginHorizontal:8
},

sendButton:{
backgroundColor:"#075E54",
paddingHorizontal:18,
paddingVertical:10,
borderRadius:20
},

send:{
color:"#fff",
fontWeight:"bold"
}

});
