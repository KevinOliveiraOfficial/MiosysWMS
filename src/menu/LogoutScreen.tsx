import { CompositeScreenProps, useFocusEffect, CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, SafeAreaView, Text, View, Alert, StyleSheet } from "react-native";

import { DrawerNavigatorParamList } from "../navigation/DrawerNavigation";
import * as Keychain from 'react-native-keychain';
import { useCallback, useEffect, useState } from "react";
import { RootStackParamList } from "../../App";

type screenProps =
CompositeScreenProps<
    NativeStackScreenProps<DrawerNavigatorParamList, 'LogoutScreen'>,
    NativeStackScreenProps<RootStackParamList>
>;

function LogoutScreen({route, navigation}: screenProps)
{
    const [logoutCount, setLogoutCount] = useState<number>(0);
    useFocusEffect(useCallback(() =>
    {
        // The screen is focused
        Alert.alert('Tem certeza que deseja sair?', 'Você será desconectado do dispositivo.',
        [
            {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () =>
                {
                    if ( navigation.canGoBack() )
                        navigation.goBack();
                }
            },
            {
                text: 'Sim',
                onPress: () =>
                {
                    setLogoutCount(prev => ++prev);
                }
            }
        ]);
    }, []));

    useEffect(() =>
    {
        if ( logoutCount === 0 )
            return;
    
        (async () =>
        {
            await Keychain.resetInternetCredentials('API');

            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                    {
                        name: 'Auth',
                        params: { screen: 'Login' },
                    },
                    ],
                })
                );
            //navigation.replace('Auth', {screen: 'Login'});
        })();
        
    }, [logoutCount]);

    if ( logoutCount === 0 )
        return <></>;
    
    return(
        <SafeAreaView style={StyleSheet.absoluteFill}>
            <View style={{flex: 1, backgroundColor: "#ffffff"}}>
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    marginHorizontal: 15,
                    flexDirection: 'row'
                }}>
                
                    <View style={{ flex: 1, marginTop: 20 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, color: "#737373", textAlign: "center", marginBottom: 20}}>Saindo...</Text>
                        <ActivityIndicator size="large" />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
};

export default LogoutScreen;