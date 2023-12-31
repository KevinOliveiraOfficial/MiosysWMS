import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createContext, useEffect, useRef, useState } from "react";

import DrawerNavigation from "./DrawerNavigation";
import BudgetsSteps from "./BudgetsSteps";
import { ActivityIndicator, Alert, BackHandler, FlatList, Image, RefreshControl, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { API } from '../../App';

import { EventEmitter } from "eventemitter3";

export const event = new EventEmitter();

export type AppStackParamList = {
    Drawer: any;
    BudgetsSteps: any;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigatorContext = createContext({
	selectedCompany: {},
    ///selectedSalesForceSellerLink: {} 
});

const AppStack = () =>
{
    const [appState, setAppState] = useState<any>({
        'isSalesForceSellerLinkLoading': true,
        'loadSalesForceSellerLinkTriggerOrigin': "init",
        'selectedSalesForceSellerLink': null,
        'salesForceSellerLinks': [],
        'isItemsLoaded': false,
        'isCustomersLoaded': false,
        'isCurrentLoading': '',
        'reloadCount': 0,
        'isAllLoaded': false,
    });

    const controller = useRef<AbortController>(new AbortController());


    useEffect(() =>
    {
        if ( appState['reloadCount'] === 0 )
            return;
    
        API.api('GET', '/sales-force/seller-link/me', {}, ( status: number, response: any ) =>
        {
            console.log('INICIANDO\n');
            if ( status === 200 )
            {
                //console.log(response['result']);
                //console.log(response['result'][0]);
                setAppState( (_prev: any) =>
                {
                    const prev: any = {..._prev};
                    prev['isSalesForceSellerLinkLoading'] = false;
                    prev['salesForceSellerLinks'] = response['result'];
                    //console.log('LOJAS P SELECIONAR', prev['salesForceSellerLinks']);
                    
                    return prev;
                });
            }
            else
            {
                Alert.alert(response.message);
                //event.emit('rebootApplication');
            }
            //
        }, controller.current );
    }, [ appState['reloadCount'] ] );

    useEffect(() =>
	{
        // nao permite voltar na tela anterior com o botao de voltar do celular
        const backAction = () =>
        {
            BackHandler.exitApp();
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );
        
	}, []);

    if ( appState['selectedSalesForceSellerLink'] === null )
  	return(
        <SafeAreaView style={{ backgroundColor: '#fff', height: '100%', width: '100%', position: 'relative',
    padding:25}}>
        {
            appState['isSalesForceSellerLinkLoading'] === true && appState['loadSalesForceSellerLinkTriggerOrigin'] !== 'refresh' ?
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
                                        event.emit('rebootApplication');
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
                        data={appState['salesForceSellerLinks']}
                        keyExtractor={(salesForceSellerLink: any) => salesForceSellerLink['salesForceCompanyLink']['salesForceCompanyLinkId'].toString()}
                        refreshControl={
                            <RefreshControl refreshing={appState['isSalesForceSellerLinkLoading'] === true && appState['loadSalesForceSellerLinkTriggerOrigin'] === 'refresh'} onRefresh={onRefresh} />
                        }
                        renderItem={ ({item: salesForceSellerLink}: any) => {
                            return(
                                <View>
                                    <View style={{flexDirection: 'row',}}>
                                        <View style={{  position: 'relative', alignItems: 'center', justifyContent: 'center', width: 100, height: 100 }}>
                                            
                                            <Image 
                                                style={{ width: '100%', height: '100%', resizeMode: 'contain'}}
                                                source={{uri: `${salesForceSellerLink['salesForceCompanyLink']['company']['logo']}`}}
                                            />
                                        </View>

                                        <View style={{marginLeft:5, marginTop:6}}>
                                            <TouchableOpacity
                                                onPress={() =>
                                                {
                                                    setAppState((_prev: any) =>
                                                        {
                                                            const prev: any = {..._prev};
                                                            prev['selectedSalesForceSellerLink'] = salesForceSellerLink;
                                                            prev['isCurrentLoading'] = 'customer';
                                                            return prev;
                                                        }
                                                    );
                                                //console.log(salesForceSellerLink)
                                                //console.log(appState['selectedSalesForceSellerLink'])
                                                }}
                                            >
                                                
                                                <Text style={{fontSize:8, color: '#ccc', }}>#{salesForceSellerLink['salesForceSellerLinkId']}</Text>

                                                <Text style={{fontSize:20,  color: '#02044F', fontWeight:'bold'}}>{salesForceSellerLink['salesForceCompanyLink']['company'].name}</Text>

                                                <Text style={{fontSize:9, color: '#02044F', marginTop: 2, }}>CNPJ: {salesForceSellerLink['salesForceCompanyLink']['company'].registrationNumber}</Text>
                                                

                                                <Text style={{fontSize:9,  color: '#ccc', marginTop: 2, }}>Sistema: {salesForceSellerLink['salesForceCompanyLink']['externalSystem'].system} - {salesForceSellerLink['salesForceCompanyLink']['externalSystemCompanyId']} (link #{salesForceSellerLink['salesForceCompanyLink']['salesForceCompanyLinkId']})</Text>

                                                <Text style={{fontSize:9,  color: '#ccc', marginTop: 2, }}>Unidade de negócio: {salesForceSellerLink['salesForceCompanyLink']['externalSystemCompanyId']}</Text>
                                                <Text style={{fontSize:9,  color: '#ccc', marginTop: 2, }}>Vendedor: {salesForceSellerLink['externalSystemSeller']['externalSystemSellerId']} - {salesForceSellerLink['externalSystemSeller']['name']}</Text>

                                            </TouchableOpacity>
                                        </View>

                                    </View>

                                </View>
                            );
                        
                        }}

                    />
                    
                    
                   
                </View>
            </View>
        }
    </SafeAreaView>
  );

    return(
        <AppNavigatorContext.Provider
            value={{
                'selectedCompany': {'company': 'Dilettare'}}}>
            <Stack.Navigator initialRouteName={"Drawer"} screenOptions={{headerShown:false}}>
                <Stack.Screen name='Drawer' component={DrawerNavigation}/>
                <Stack.Screen name='BudgetsSteps' component={BudgetsSteps}  />
            </Stack.Navigator>
	    </AppNavigatorContext.Provider>
    )
}

export default AppStack;