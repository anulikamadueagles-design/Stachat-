import React, {useContext} from "react";

import {
View,
Text,
TouchableOpacity,
StyleSheet
} from "react-native";


import {AuthContext} from "../context/AuthContext";



export default function SettingsScreen({navigation}){


const {logout} = useContext(AuthContext);



return(

<View style={styles.container}>


<Text style={styles.title}>
Settings
</Text>



<TouchableOpacity

style={styles.button}

onPress={()=>navigation.navigate("Profile")}

>

<Text style={styles.buttonText}>
My Profile
</Text>

</TouchableOpacity>




<TouchableOpacity

style={styles.logout}

onPress={logout}

>

<Text style={styles.logoutText}>
Logout
</Text>

</TouchableOpacity>



</View>

);

}




const styles = StyleSheet.create({

container:{
flex:1,
padding:30,
backgroundColor:"#ECE5DD"
},


title:{
fontSize:30,
fontWeight:"bold",
marginBottom:30
},


button:{
backgroundColor:"#075E54",
padding:15,
borderRadius:10,
marginBottom:20
},


buttonText:{
color:"white",
textAlign:"center",
fontWeight:"bold"
},


logout:{
backgroundColor:"#B00020",
padding:15,
borderRadius:10
},


logoutText:{
color:"white",
textAlign:"center",
fontWeight:"bold"
}


});
