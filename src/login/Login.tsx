import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackNavigatorParamList } from "./AuthStack";
import { RootStackParamList } from "../../App";
import { Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import MaterialIcons from 'react-native-vector-icons/FontAwesome6';

type screenProps = CompositeScreenProps<
  NativeStackScreenProps<AuthStackNavigatorParamList, 'Login'>,
  NativeStackScreenProps<RootStackParamList>
>;

function Login({navigation}: screenProps )
{
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    return(
        <SafeAreaView style={{height: '100%', width: '100%', position: 'relative', backgroundColor:'#fff',justifyContent:'center', paddingHorizontal:20}}>
            <View 
                style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', width: "100%",     height: 100, alignSelf: "center" }}>
                <Image style={{ width: '100%', height: '100%', resizeMode: 'contain'}} source={require('../assets/images/connectforce_logo_4698x1024.png')} />
            </View>
            {/* Login */}
            <View style={{marginTop: 50}}>
                <Text 
                    style={{
                      fontFamily: 'lucida grande', 
                      fontSize: 28, 
                      fontWeight:'500', 
                      color:'#333', 
                      marginBottom: 2      
                    }}>
                  Login
              </Text>
            </View>
            {/*usuario*/}
            <View 
                style={{
                    flexDirection: 'row',  
                    borderBottomColor:'#ccc', 
                    borderBottomWidth:1, marginBottom:25, 
                    paddingBottom: 3, 
                    marginTop: 20
                }}>
                <MaterialIcons 
                    name='user' 
                    size={20} 
                    color='#666' 
                    style={{marginTop: 4}} 
                />
                <TextInput 
                    placeholder='Digite seu usuário ' 
                    placeholderTextColor={"#000000"}
                    style={{ padding: 0, marginLeft: 3, width:'80%', color: "#000000"}}
                    onChangeText={(user: string) => setUser(user)}
                    defaultValue={user}
                />
            </View>
            {/*Senha*/}
            <View 
                style={{
                    flexDirection: 'row',  
                    borderBottomColor:'#ccc', 
                    borderBottomWidth:1, marginBottom:25, 
                    paddingBottom: 3, 
                    marginTop: 1
                }}>
                <MaterialIcons 
                    name='lock' 
                    size={20} 
                    color='#666' 
                    style={{marginTop: 4}} 
                />
                <TextInput 
                    placeholder='Digite sua senha'
                    placeholderTextColor={"#000000"}
                    style={{ padding: 0, marginLeft: 3, width:'80%', color: "#000000"}}
                    secureTextEntry={true}
                    onChangeText={( password: string ) => setPassword(password)}
                    defaultValue={password}
                />
            </View>

            <View style={{marginTop: 10}}>
                <TouchableOpacity onPress={() =>
                    {
                        navigation.navigate('AppStack', {
                            screen: 'Drawer',
                            
                        });
                    
                    }} 
                    style={{
                        backgroundColor: '#1b5f7e', 
                        padding:15, 
                        borderRadius:10 
                    }}>
                    <Text style={{
                        
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: 16,
                        color: '#fff', 
                    }}>Entrar</Text>
              </TouchableOpacity>
          </View>
        </SafeAreaView>
    );
}

export default Login;