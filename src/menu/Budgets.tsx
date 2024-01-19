import { CompositeScreenProps } from '@react-navigation/native';
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {Text, SafeAreaView, View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import {Card} from "react-native-paper";
import { DrawerNavigatorParamList } from '../navigation/DrawerNavigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppNavigatorContext, AppStackParamList } from '../navigation/AppStack';
import {RootStackParamList, API} from '../../App';

type screenProps = CompositeScreenProps<
  NativeStackScreenProps<DrawerNavigatorParamList, 'Budgets'>,
  NativeStackScreenProps<AppStackParamList>
>;

function Budgets({ navigation}: screenProps)
{
    const NavigatorContext = useContext(AppNavigatorContext);
	const selectedSalesForceWMSUser: any = NavigatorContext.selectedSalesForceWMSUser;
	const selectedCompany: any = selectedSalesForceWMSUser['salesForceCompanyLink']['company'];
    const controller = useRef<AbortController>(new AbortController());

    const [budgets, setBudgets] = useState<any>([]);
    const [budgetsExtraData, setBudgetsExtraData] = useState<number>(0);
    const [loadBudgetsCount, setLoadBudgetsCount] = useState<number>(0);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(true);

    useEffect(() =>
	{
        console.log(budgets);

	}, [ budgets ] );

    useEffect(() =>
	{
        if ( loadBudgetsCount === 0 )
            return;

        // carrega itens
        API.api('GET', '/sales-force/wms/orders/collect', {sales_force_wms_user_id: selectedSalesForceWMSUser['salesForceWMSUserId'], timestamp: 0}, ( status: number, response: any ) =>
        {
            //console.log(status, response);
            if ( status === 200 )
            {
                setBudgets( (prev: any) => [...response['result'], ...prev]);
                setBudgetsExtraData( prev => prev + 1 );
            }
            else
            {
                Alert.alert("Falha ao obter novos pedidos", response.message);
            }
            setIsRefreshing(false);
        }, controller.current );

	}, [ loadBudgetsCount ] );

    useEffect(() =>
	{
        // Init
        setLoadBudgetsCount( prev => prev + 1 );

        controller.current = new AbortController();
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
        
        setBudgets([]);
        setIsRefreshing(true);
        setLoadBudgetsCount( prev => prev + 1 );
    }, []);
    
    return(
        <SafeAreaView style={{height: '100%', width: '100%', position: 'relative', backgroundColor:'#fff',paddingHorizontal: 10}}>
            {
                isRefreshing === true ?
                <View style={{ marginTop: 25 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 18, color: "#737373", textAlign: "center", marginBottom: 20}}>Carregando...</Text>
                    <ActivityIndicator size="large" />
                </View>
                :
              	budgets.length === 0 ?
					<View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
						<Text  style={{fontSize: 16, color:"#000000"}}>
							Não há orçamentos pendentes!
						</Text>
					</View>
              	:
                    <View style={{flex:1}}>
                        <View style={{marginBottom: 10}}>
                            <Text style={{color:'#02044F', fontSize: 16, fontWeight: 'bold'}}>Loja {selectedCompany['name']}</Text>
                        </View>
                        <FlatList
                        showsVerticalScrollIndicator={true}
                        data={budgets}
                        extraData={budgetsExtraData}
                        keyExtractor={(budget: any) => budget['externalSystemOrderId'] }
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                        }
                        renderItem={ ({item: budget}: any) =>
                        {
                            return(
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate('BudgetsSteps', {
                                        screen: 'BudgetsDescription',
                                        params: {
                                            'budget': budget
                                        }
                                    })
                                }}
                            >
                               <Card
                                    mode="contained" 
                                    style={{marginBottom: 10, paddingVertical: 10, backgroundColor: '#ededed'}}	
                                >
                                    <Card.Content>   
                                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                
                                                    <Text style={{color:'#000000', fontSize: 15}}>Orçamento #{budget['externalSystemOrderId']}</Text>
                                                
                                                <Text style={{color:'red', fontSize: 13}}>Pendente</Text>
                                            </View>
                                    </Card.Content>
                               </Card>
                            </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            }
        </SafeAreaView>
    );
}

export default Budgets;