import * as ImagePicker from "expo-image-picker";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import {
  updateProfile
} from "firebase/auth";

import {
  storage,
  auth
} from "../config/firebase";

export async function uploadProfilePhoto(){

const permission=
await ImagePicker.requestMediaLibraryPermissionsAsync();

if(!permission.granted){
alert("Permission denied");
return;
}

const result=
await ImagePicker.launchImageLibraryAsync({
quality:0.8,
allowsEditing:true,
aspect:[1,1]
});

if(result.canceled) return;

const response=
await fetch(result.assets[0].uri);

const blob=
await response.blob();

const filename=
"profile_"+Date.now()+".jpg";

const imageRef=
ref(storage,"profiles/"+filename);

await uploadBytes(imageRef,blob);

const url=
await getDownloadURL(imageRef);

await updateProfile(auth.currentUser,{
photoURL:url
});

return url;

}
