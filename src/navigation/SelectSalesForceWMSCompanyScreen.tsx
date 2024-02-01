import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActivityIndicator, SafeAreaView, View, TouchableOpacity, FlatList, BackHandler, Image, Alert, RefreshControl } from 'react-native';
import { Text } from "react-native-paper";
//import { event } from './DrawerNavigation';
//import realm, { copyRealmObject } from '../Schemas';
import {RootStackParamList, API} from '../../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';
import { useFocusEffect } from '@react-navigation/native';
/*-export const updateUserSelectedSalesForceWMSUser = (selectedSalesForceWMSUser: any) =>
{
    const loggedUserRealm: any = realm.objects('logged_user')[0];

    // If found
    if ( loggedUserRealm )
    {
        realm.write(() =>
        {
            loggedUserRealm['selectedSalesForceWMSUser'] = selectedSalesForceWMSUser === null ? null : JSON.stringify(selectedSalesForceWMSUser);
        });
    }
};*/
const SelectSalesForceWMSCompanyScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'SelectSalesForceWMSCompanyScreen'> ) =>
{  
    const logoutWithoutClearData = () =>
    {
        (async () =>
        {
            await Keychain.resetInternetCredentials('API');
    
            /*realm.write(() =>
            {
                realm.deleteAll();
            });*/
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                    {
                        name: 'Auth',
                        params: { screen: 'Login' }
                    }
                    ],
                })
            );
        })();
    };

    const [isSalesForceWMSUserLoading, setIsSalesForceWMSUserLoading] = useState<boolean>(true);
    const [loadSalesForceWMSUserTrigger, setloadSalesForceWMSUserTrigger] = useState<number>(0);
    const [loadSalesForceWMSUserTriggerOrigin, setLoadSalesForceWMSUserTriggerOrigin] = useState<string>("init");
    const [salesForceWMSUsers, setSalesForceWMSUsers] = useState<any[]>([]);

    const controller = useRef<AbortController>(new AbortController());

    const selectSalesForceWMSCompany = useCallback(( salesForceWMSCompany: any ) =>
    {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                {
                    name: 'AppStack',
                    params: {
                        selectedSalesForceWMSUser: salesForceWMSCompany,
                        screen: 'Drawer',
                    }
                }
                ],
            })
        );
    }, [navigation]);

    // useEffect vai executar quando o usuário quiser trocar de loja
    useEffect(() =>
    {
        if ( loadSalesForceWMSUserTrigger === 0 )
            return;
    
        API.api('GET', '/sales-force/wms/users/me', {}, ( status: number, response: any ) =>
        {
            console.log(response);
            if ( status === 200 )
            {
                setSalesForceWMSUsers(response['result']);
                setIsSalesForceWMSUserLoading(false);
            }
            else
            {
                Alert.alert(response.message);
                logoutWithoutClearData();
            }
        }, controller.current );
    }, [ loadSalesForceWMSUserTrigger ] );

    const onRefresh = useCallback(() => 
    {
        // Abort current load
        controller.current.abort();
        controller.current = new AbortController();

        setLoadSalesForceWMSUserTriggerOrigin("refresh");
        setIsSalesForceWMSUserLoading(true);
        setSalesForceWMSUsers([]);
        setloadSalesForceWMSUserTrigger( prev => ++prev );
    }, []);

    const init = () =>
    {     
        // Load seller links
        setloadSalesForceWMSUserTrigger( prev => ++prev );
        /*   
        const loggedUserRealm: any = realm.objects('logged_user')[0];

        // If found user
        if ( loggedUserRealm )
        {
            const loggedUser = copyRealmObject(loggedUserRealm);
            
            if ( loggedUser['selectedSalesForceWMSUser'] !== null )
            {
                // Set selected salesforce seller link
                setAppState((_prev:any) =>         
                {
                    const prev: any = {..._prev};

                    prev['isSalesForceWMSUserLoading'] = false;
                    prev['selectedSalesForceWMSUser'] = JSON.parse(loggedUser['selectedSalesForceWMSUser']);
                    prev['isAllLoaded'] = true;
                    return prev;
                });
            }
            else
            {
                // Load seller links
                setAppState((_prev:any) =>         
                {
                    const prev: any = {..._prev};

                    prev['reloadCount']++;
                    return prev;
                });
            }
        }
        else
        {
            // Something wrong
            // Clear API credentials
            Alert.alert("Oops", "Algo de errado aconteceu. Por favor, faça login novamente.")
            logoutWithoutClearData();
        }*/
    };

	useEffect(() =>
	{

        // Abort current load
        controller.current = new AbortController();

        init();
        
        return () =>
        {

            // Cancel the request before component unmounts
            controller.current.abort();
        };
        
	}, []);

  	return(
        <SafeAreaView style={{ backgroundColor: '#fff', height: '100%', width: '100%', position: 'relative',
    padding:25}}>
        {
            isSalesForceWMSUserLoading === true && loadSalesForceWMSUserTriggerOrigin !== 'refresh' ?
            <View style={{ marginTop: 25 }}>
                <Text style={{ fontWeight: "bold", fontSize: 18, color: "#737373", textAlign: "center", marginBottom: 20}}>Carregando...</Text>
                <ActivityIndicator size="large" />
            </View>
            :

            <View style={{flex: 1,  }}>
                <View style={{ marginBottom: 10}}>
                    <Text style={{fontSize:20, alignSelf: 'center', color: '#02044F', fontWeight: 'bold'}}>Selecione a Loja</Text>
                </View>
                <View>
                    <TouchableOpacity
                        style={{
                            padding: 10,
                            paddingHorizontal: 15,
                            borderRadius: 10,
                            backgroundColor: '#1b5f7e',
                    
                        }}
                        onPress={() => 
                        {
                            Alert.alert('Tem certeza que deseja sair?', undefined,
                            [
                                {
                                    text: 'Cancelar',
                                    style: 'cancel'
                                },
                                {
                                    text: 'Sim',
                                    onPress: () =>
                                    {
                                        logoutWithoutClearData();
                                    }
                                }
                            ]);
                            
                        }}
                    >
                        <Text style={{textAlign: 'center', color: "#ffffff"}}>Sair</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 70, alignItems:'center'}}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={salesForceWMSUsers}
                        keyExtractor={(salesForceWMSUser: any) => salesForceWMSUser['salesForceCompanyLink']['salesForceCompanyLinkId'].toString()}
                        refreshControl={
                            <RefreshControl refreshing={isSalesForceWMSUserLoading === true && loadSalesForceWMSUserTriggerOrigin === 'refresh'} onRefresh={onRefresh} />
                        }
                        renderItem={ ({item: salesForceWMSUser}: any) => {
                            return(
                                <TouchableOpacity
                                    onPress={() =>
                                    {
                                        selectSalesForceWMSCompany( salesForceWMSUser );
                                    }}
                                >
                                    <View style={{flexDirection: 'row',}}>
                                        <View style={{  position: 'relative', alignItems: 'center', justifyContent: 'center', width: 100, height: 100 }}>
                                            
                                            <Image 
                                                style={{ width: '100%', height: '100%', resizeMode: 'contain'}}
                                                source={{uri: `${salesForceWMSUser['salesForceCompanyLink']['company']['logo']}`}}
                                            />
                                        </View>

                                        <View style={{marginLeft:5, marginTop:6}}>  
                                            <Text style={{fontSize:8, color: '#787878', }}>#{salesForceWMSUser['salesForceWMSUserId']}</Text>

                                            <Text style={{fontSize:20,  color: '#02044F', fontWeight:'bold'}}>{salesForceWMSUser['salesForceCompanyLink']['company'].name}</Text>

                                            <Text style={{fontSize:9, color: '#02044F', marginTop: 2, }}>CNPJ: {salesForceWMSUser['salesForceCompanyLink']['company'].registrationNumber}</Text>
                                            

                                            <Text style={{fontSize:9,  color: '#787878', marginTop: 2, }}>Sistema: {salesForceWMSUser['salesForceCompanyLink']['externalSystem'].system} - {salesForceWMSUser['salesForceCompanyLink']['externalSystemCompanyId']} (link #{salesForceWMSUser['salesForceCompanyLink']['salesForceCompanyLinkId']})</Text>

                                            <Text style={{fontSize:9,  color: '#787878', marginTop: 2, }}>Unidade de negócio: {salesForceWMSUser['salesForceCompanyLink']['externalSystemCompanyId']}</Text>                
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        
                        }}
                    />
                </View>
            </View>
        }
    </SafeAreaView>
  );


    // tela de carregammento
    //if ( appState['isAllLoaded'] === false )
    return (
        <View style={{ marginTop: 25 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, color: "#737373", textAlign: "center", marginBottom: 20}}>Carregando...</Text>
            <ActivityIndicator size="large" />
        </View>
        );
};
  
export default SelectSalesForceWMSCompanyScreen;