import React,{
useState
} from "react";

import{
View,
TextInput,
FlatList,
Text,
StyleSheet
} from "react-native";

export default function SearchScreen(){

const[text,setText]=useState("");

return(

<View style={styles.container}>

<TextInput
style={styles.input}
placeholder="Search chats..."
value={text}
onChangeText={setText}
/>

<FlatList
data={[]}
keyExtractor={(item,index)=>index.toString()}
renderItem={({item})=><Text>{item}</Text>}
/>

</View>

);

}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#ECE5DD",
padding:15
},

input:{
backgroundColor:"#fff",
padding:12,
borderRadius:10,
marginBottom:15
}

});
