import {useEffect, useRef, useState} from 'react';
import {View, Text, Image, TextInput, TouchableOpacity, Alert} from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Keychain from 'react-native-keychain';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
//import realm, { copyRealmObject } from '../Schemas';
import {AuthStackNavigatorParamList} from './AuthStack';
import {RootStackParamList, API} from '../../App';
import { CommonActions } from '@react-navigation/native';

type screenProps = CompositeScreenProps<
  NativeStackScreenProps<AuthStackNavigatorParamList, 'Login'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function Login({ navigation }: screenProps )
{
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const controller = useRef<AbortController>(new AbortController());

    const [state, setState] = useState({
        "canSubmit": true,
        "submitCount": 0,
    });

    useEffect(() =>
    {
        if ( state['submitCount'] === 0 )
            return;

        if ( user.trim().length === 0 )
        {
            Alert.alert("Digite seu usuário!");
            setState( (_prev: any) =>
            {
                const prev = {..._prev};
                prev['canSubmit'] = true;
                return prev;
            });
            return;
        }
    
        if ( password.length === 0 )
        {
            Alert.alert("Digite sua senha!");
            setState( (_prev: any) =>
            {
                const prev = {..._prev};
                prev['canSubmit'] = true;
                return prev;
            });
            return;
        }

        API.api('POST', '/auth', {'identifier': user, 'password': password}, function( status: number, response: any )
        {
            if ( status === 200 )
            {
                API.init( response.userId.toString(), response.authorization );
                API.api('GET', '/me', {}, function( status2: number, response2: any )
                {
                    if ( status2 === 200 )
                    {
                        Alert.alert("Bem vindo ", `Olá, ${response2.firstName}`);
            
                        // If found
                        /*realm.write(() =>
                        {
                            // If user has disconnected instead logout
                            const loggedUserRealm: any = realm.objects('logged_user')[0];
                            if ( loggedUserRealm )
                            {
                                // If is the same user
                                if ( loggedUserRealm['userId'] === response2.userId )
                                {
                                    // Update info
                                    loggedUserRealm['firstName'] = response2.firstName;
                                    loggedUserRealm['lastName'] = response2.lastName;
                                }
                            }
                            else
                            {
                                // Create new object
                                realm.create('logged_user',
                                {
                                    userId: response2.userId,
                                    firstName: response2.firstName,
                                    lastName: response2.lastName,
                                });
                            }
                        });*/

                        // Set user info
                        API.me = response2;

                        // Store the credentials 
                        (async () =>
                        {
                            console.log(user, password)
                            // Store the credentials
                            await Keychain.setGenericPassword(user, password);
                            await Keychain.setInternetCredentials('API', response.userId.toString(), response.authorization);
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [
                                    {
                                        name: 'SelectSalesForceWMSCompanyScreen'
                                    }
                                    ],
                                })
                            );
                        })();
                    }
                    else
                    {
                        Alert.alert( response2.message );
                    }

                    setState( (_prev: any) =>
                    {
                        const prev = {..._prev};
                        prev['canSubmit'] = true;
                        return prev;
                    });
                }, controller.current );
            }
            else
            {
                Alert.alert( response.message );
                setState( (_prev: any) =>
                {
                    const prev = {..._prev};
                    prev['canSubmit'] = true;
                    return prev;
                });
            }
        }, controller.current ); 
    }, [state['submitCount']]);

    useEffect(() =>
    {
        controller.current = new AbortController();
    
        (async () => {
            try{
                // Retrieve the last credentials
                const credentials = await Keychain.getGenericPassword();
                if (credentials)
                {
                    setUser(credentials.username);  
                    setPassword('');  
                }
            } catch(error)
            {
                console.log("Keychain couldn't be acessed!", error);
            }
        })();

        return () =>
        {
            // Cancel the request before component unmounts
            controller.current.abort();
        };
        
    }, []);
    return (
      <View style={{
              height: '100%', width: '100%', 
              position: 'relative', backgroundColor:'#fff',
              justifyContent:'center', paddingHorizontal:20
              }}>
              {/* logo da empresa */}
          <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', width: "100%", height: 100, alignSelf: "center" }}>
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
                  name='person' 
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
                  autoCapitalize='none'
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
                  autoCapitalize='none'
              />
          </View>
          {/* botao de login */ }
          <View style={{marginTop: 10}}>
              <TouchableOpacity
                disabled={state['canSubmit'] === false}
                onPress={() =>
                {  
                    setState( (_prev: any) =>
                    {
                        if ( _prev['canSubmit'] === false )
                            return _prev;

                        const prev = {..._prev};
                        prev['canSubmit'] = false;
                        prev['submitCount']++;
                        return prev;
                    });
                }} 
                style={{
                    backgroundColor: '#1b5f7e', 
                    padding:15, 
                    borderRadius:10,
                    opacity: state['canSubmit'] === false ? 0.4 : 1.0
                }}>
                  <Text style={{
                      
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: 16,
                      color: '#fff', 
                  }}>Entrar</Text>
              </TouchableOpacity>
          </View>
      </View>
    );
};

export default Login;