import { CompositeScreenProps } from '@react-navigation/native';
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {Text, SafeAreaView, View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { DrawerNavigatorParamList } from '../navigation/DrawerNavigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppNavigatorContext, AppStackParamList } from '../navigation/AppStack';
import {RootStackParamList, API} from '../../App';
import Moment from 'moment';

type screenProps = CompositeScreenProps<
  NativeStackScreenProps<DrawerNavigatorParamList, 'Orders'>,
  NativeStackScreenProps<AppStackParamList>
>;

function Orders({ route, navigation }: screenProps)
{
    const NavigatorContext = useContext(AppNavigatorContext);
	const selectedSalesForceWMSUser: any = NavigatorContext.selectedSalesForceWMSUser;
	const selectedCompany: any = selectedSalesForceWMSUser['salesForceCompanyLink']['company'];
    const controller = useRef<AbortController>(new AbortController());

    const syncedOrder = route.params?.syncedOrder;
    const [syncedOrders, setSyncedOrders] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersExtraData, setOrdersExtraData] = useState<boolean>(false);
    const [loadOrdersCount, setLoadOrdersCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [timestamp, setTimestamp] = useState<number>(0);

    useEffect(() =>
    {
        console.log("-------------SYNCED ORDER---------", syncedOrder);
        if ( syncedOrder === undefined )
            return;
    
        setSyncedOrders( (_prev: any) =>
        {
            const prev = [..._prev];
            const index = prev.findIndex( (k: any) => k['externalSystemOrderId'] === syncedOrder['externalSystemOrderId']);
            if ( index >= 0 )
                prev[index] = syncedOrder;
            else
                prev.push(syncedOrder);

            return prev;
        });
    }, [syncedOrder]);

    useEffect(() =>
	{
        if ( loadOrdersCount === 0 )
            return;

        console.log("getting from timestamp " + timestamp);   
        // carrega itens
        API.api('GET', '/sales-force/wms/orders/collect', {sales_force_wms_user_id: selectedSalesForceWMSUser['salesForceWMSUserId'], timestamp: timestamp}, ( status: number, response: any ) =>
        {
            console.log(status, response);
            // status -1 = Aborted
            if ( status === -1 )
            {
                return;
            }
            if ( status === 200 )
            {
                setOrders( (prev: any) => [...response['result'], ...prev]);
                setOrdersExtraData( prev => !prev );
                setTimestamp(response['lastTimestamp']);
                setLoadOrdersCount( prev => ++prev );
            }
            else
            {
                //Alert.alert("Falha ao obter novos pedidos", "Tentaremos novamente em 5 segundos" + response.message);
                console.log("Falha ao obter novos pedidos.", response.message);

                // Try again after 5 seconds
                setTimeout(() => {
                    setLoadOrdersCount( prev => ++prev );
                }, 5000);
            }
            setIsLoading(false);
            setIsRefreshing(false);
        }, controller.current );
            
	}, [ loadOrdersCount ] );

    useEffect(() =>
	{
        // Init
        setLoadOrdersCount( prev => ++prev);

        return () =>
        {
            // Cancel the request before component unmounts
            controller.current.abort();
        };
	}, [] );

    const onRefresh = useCallback(() => 
    {
        // Abort current load
        controller.current.abort();
        controller.current = new AbortController();
        
        setOrders([]);
        setTimestamp(0);
        setIsLoading(false);
        setIsRefreshing(true);
        setLoadOrdersCount( prev => ++prev );
    }, []);
    
    return(
        <SafeAreaView style={StyleSheet.absoluteFill}>
            <View style={{flex:1, backgroundColor: "#ffffff"}}>
                <View style={{marginVertical: 10}}>
                    <Text style={{color:'#02044F', fontSize: 16, fontWeight: 'bold', textAlign: "center"}}>{selectedCompany['name']}</Text>
                </View>
                <FlatList
                    ListHeaderComponent=
                    {
                        isLoading === true ?
                        <View style={{ marginTop: 25 }}>
                            <Text style={{ fontWeight: "bold", fontSize: 18, color: "#737373", textAlign: "center", marginBottom: 20}}>Carregando...</Text>
                            <ActivityIndicator size="large" />
                        </View>
                        :
                        isLoading === false && isRefreshing === false ?
                        <View style={{ marginVertical: 25, flexDirection: "row", marginHorizontal: 20, justifyContent: "center" }}>
                            <ActivityIndicator size="small" />
                            <Text style={{ fontWeight: "bold", color: "#737373", textAlign: "center", marginLeft: 5}}>Esperando por novos pedidos...</Text>
                            
                        </View>
                        :
                        <></>
                    }
                    showsVerticalScrollIndicator={true}
                    data={orders}
                    extraData={ordersExtraData}
                    keyExtractor={(order: any) => order['externalSystemOrderId'] }
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    }
                    renderItem={ ({item: order}: any) =>
                    {
                        const isSynced = syncedOrders.find( (k: any) => k['externalSystemOrderId'] === order['externalSystemOrderId'] ) !== undefined;
                        return(
                        <TouchableOpacity
                            style={{
                                backgroundColor: isSynced === true ? "#bdfcc1" : '#ffffff',
                                padding: 20,
                                borderRadius: 5,
                                shadowColor: "#171717",
                                shadowOffset: {
                                    width: 0,
                                    height: 2,
                                },
                                shadowOpacity: 0.2,
                                shadowRadius: 3,
                                elevation: 7,
                                marginTop: 5,
                                marginBottom: 10,
                                marginHorizontal: 10,
                                borderWidth: 1,
                                borderColor: isSynced === true ? "#94fd9b" : '#e3e3e3',
                                flex: 1,
                                position: "relative"
                            }}
                            onPress={() => {
                                navigation.navigate('OrderSteps', {
                                    screen: 'OrdersDescription',
                                    params: {
                                        'order': order,
                                        mainRouteKey: route.key
                                    }
                                })
                            }}
                        >
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={{color:'#000000', fontSize: 15}}>Pedido #{order['externalSystemOrderId']}</Text>
                                {
                                    isSynced === true ?
                                    <Text style={{color:'#026902', fontWeight: "bold"}}>Enviado</Text>
                                    :
                                    <Text style={{color:'#bd0407', fontWeight: "bold"}}>Pendente</Text>
                                }
                            </View>
                            <View>
                                <Text style={{color: "#737373", fontSize: 14}}>Criado em {Moment(new Date(order['preCheckoutAt'] ?? order['checkoutAt'])).format('DD/MM/YYYY [às] HH:mm:ss')}</Text>
                                <Text style={{color:'#737373', fontSize: 14}}>{order['externalSystemOrderItems'].length} {order['externalSystemOrderItems'].length > 1 ? "itens" : "item"}</Text>
                            </View>
                        </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

export default Orders;