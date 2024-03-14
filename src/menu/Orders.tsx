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

    const [maxResultReached, setMaxResultReached] = useState<boolean>(false);
    const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
    const [loadOrdersTriggerOrigin, setLoadOrdersTriggerOrigin] = useState<string>("init");
    const [loadOrdersCount, setLoadOrdersCount] = useState<number>(0);

    const [listenOrdersCount, setListenOrdersCount] = useState<number>(0);

    const [listenOrdersBiggestTimestamp, setListenOrdersBiggestTimestamp] = useState<number>(0);
    const [listenOrdersOffsetExternalSystemOrderId, setListenOrdersOffsetExternalSystemOrderId] = useState<string>("");

    const [loadOrdersLowestTimestamp, setLoadOrdersLowestTimestamp] = useState<number>(0);
    const [loadOrdersOffsetExternalSystemOrderId, setLoadOrdersOffsetExternalSystemOrderId] = useState<string>("");

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
        if ( listenOrdersCount === 0 )
            return;

        const request: any = { sales_force_wms_user_id: selectedSalesForceWMSUser['salesForceWMSUserId'] };

        if ( listenOrdersBiggestTimestamp !== 0 )
            request.timestamp = listenOrdersBiggestTimestamp;

        if ( listenOrdersOffsetExternalSystemOrderId !== "" )
            request.offset_external_system_order_id = listenOrdersOffsetExternalSystemOrderId;

        console.log("request" + request);

        // carrega itens
        API.api('GET', '/sales-force/wms/orders/collect/listen', request, ( status: number, response: any ) =>
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
                setListenOrdersOffsetExternalSystemOrderId( response['biggestTimestampOffsetExternalSystemOrderId'] );
                setListenOrdersBiggestTimestamp( response['biggestTimestamp'] );
                setListenOrdersCount( prev => ++prev );
            }
            else
            {
                //Alert.alert("Falha ao obter novos pedidos", "Tentaremos novamente em 5 segundos" + response.message);
                console.log("Falha ao obter novos pedidos.", response.message);

                // Try again after 5 seconds
                setTimeout(() => {
                    setListenOrdersCount( prev => ++prev );
                }, 5000);
            }
        }, controller.current );
	}, [ listenOrdersCount ] );

    useEffect(() =>
	{
        if ( loadOrdersCount === 0 )
            return;

        const request: any = {
            sales_force_wms_user_id: selectedSalesForceWMSUser['salesForceWMSUserId'],
            fetch_limit: 50
        };

        if ( loadOrdersLowestTimestamp !== 0 )
            request.timestamp_lower_than = loadOrdersLowestTimestamp;

        if ( loadOrdersOffsetExternalSystemOrderId !== "" )
            request.offset_external_system_order_id = loadOrdersOffsetExternalSystemOrderId;

        // carrega itens
        API.api('GET', '/sales-force/wms/orders/collect', request, ( status: number, response: any ) =>
        {
            console.log(status, response);
            // status -1 = Aborted
            if ( status === -1 )
            {
                return;
            }
            if ( status === 200 )
            {
                const result = response['result'];
                const resultLength = result.length;

                if ( resultLength < request.fetch_limit )
                {
                    setMaxResultReached(true);
                }

                if ( resultLength > 0 )
                {
                    setOrders( (prev: any) => [...prev, ...result] );
                    setOrdersExtraData( prev => !prev );
                    setLoadOrdersLowestTimestamp( response['lowestTimestamp'] );
                    setLoadOrdersOffsetExternalSystemOrderId( response['lowestTimestampOffsetExternalSystemOrderId'] );

                    if ( listenOrdersCount === 0 )
                    {
                        setListenOrdersOffsetExternalSystemOrderId( response['biggestTimestampOffsetExternalSystemOrderId'] );
                        setListenOrdersBiggestTimestamp( response['biggestTimestamp'] );
                        //setListenOrdersCount( prev => ++prev );
                    }
                }
            }
            else
            {

            }
            setIsLoadingOrders(false);
        }, controller.current );
    }, [ loadOrdersCount ]);

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

        // Listen parameters
        setListenOrdersOffsetExternalSystemOrderId("");
        setListenOrdersBiggestTimestamp(0);
        setListenOrdersCount(0);

        // Load parameters
        setLoadOrdersLowestTimestamp(0);
        setLoadOrdersOffsetExternalSystemOrderId("");

        setLoadOrdersTriggerOrigin("refresh");
        setIsLoadingOrders(false);
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
                        isLoadingOrders === true && loadOrdersTriggerOrigin === 'init' ?
                        <View style={{ marginTop: 25 }}>
                            <Text style={{ fontWeight: "bold", fontSize: 18, color: "#737373", textAlign: "center", marginBottom: 20}}>Carregando...</Text>
                            <ActivityIndicator size="large" />
                        </View>
                        :
                        <View style={{ marginVertical: 25, flexDirection: "row", marginHorizontal: 20, justifyContent: "center" }}>
                            <ActivityIndicator size="small" />
                            <Text style={{ fontWeight: "bold", color: "#737373", textAlign: "center", marginLeft: 5}}>Esperando por novos pedidos...</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={true}
                    data={orders}
                    extraData={ordersExtraData}
                    keyExtractor={(order: any) => order['externalSystemOrderId'] }
                    refreshControl={
                        <RefreshControl refreshing={isLoadingOrders === true && loadOrdersTriggerOrigin === "refresh"} onRefresh={onRefresh} />
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
                    onEndReached={ () =>
                    {
                        if ( maxResultReached === true || isLoadingOrders === true || orders.length === 0 )
                            return;

                        setLoadOrdersTriggerOrigin('scroll');
                        setIsLoadingOrders(true);
                        setLoadOrdersCount( prev => ++prev );
                    }}
                    ListFooterComponent=
                    {
                        isLoadingOrders === true && loadOrdersTriggerOrigin === 'scroll' ?
                        <View style={{ marginTop: 10, marginBottom: 20 }}>
                            <Text style={{ fontWeight: "bold", fontSize: 18, color: "#737373", textAlign: "center", marginBottom: 20}}>Carregando mais resultados...</Text>
                            <ActivityIndicator size="large" />
                        </View>
                        :
                        maxResultReached === true && orders.length !== 0 ?
                        <View style={{ marginHorizontal: "5%", marginTop: 10, marginBottom: 20 }}>
                            <Text style={{ fontWeight: "bold", fontSize: 18, color: "#737373", textAlign: "center"}}>Não há mais pedidos para serem carregados</Text>
                        </View> 
                        :
                        <></>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

export default Orders;