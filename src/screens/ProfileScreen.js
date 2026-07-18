import React,{
useContext
} from "react";

import{
View,
Text,
StyleSheet
} from "react-native";

import{
AuthContext
} from "../context/AuthContext";

export default function ProfileScreen(){

const {user}=useContext(AuthContext);

return(

<View style={styles.container}>

<Text style={styles.name}>
{user?.displayName || "User"}
</Text>

<Text style={styles.email}>
{user?.email}
</Text>

</View>

);

}

const styles=StyleSheet.create({

container:{
flex:1,
justifyContent:"center",
alignItems:"center",
backgroundColor:"#ECE5DD"
},

name:{
fontSize:24,
fontWeight:"bold"
},

email:{
marginTop:10,
fontSize:16,
color:"#666"
}

});
