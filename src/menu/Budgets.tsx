import { CompositeScreenProps } from '@react-navigation/native';
import React, { useState, useEffect, useRef, useContext } from 'react';
import {Text, SafeAreaView, View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import {Card} from "react-native-paper";
import { DrawerNavigatorParamList } from '../navigation/DrawerNavigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppNavigatorContext, AppStackParamList } from '../navigation/AppStack';

type screenProps = CompositeScreenProps<
  NativeStackScreenProps<DrawerNavigatorParamList, 'Budgets'>,
  NativeStackScreenProps<AppStackParamList>
>;

function Budgets({ navigation}: screenProps)
{
    /*
    // carrega pedidos
    API.api('GET', `/sales-force/wms/${selectedSalesForceSellerLink['salesForceSellerLinkId']}/order`, {}, ( status: number, response: any ) =>
    {
        if ( status === 200 )
        {
            // push order
        }
    }
    // Sincroniza
    API.api('POST', `/sales-force/wms/${selectedSalesForceSellerLink['salesForceSellerLinkId']}/order`, {}, ( status: number, response: any ) =>
    {
        if ( status === 200 )
        {
            // push order
        }
    }
    */
    const [budgetsState, setBudgetsState] = useState<any>(
        {
            'budgets': 
            [

                {
                "externalSystemOrderId": "70156933",
                "externalSystemPaymentTypeId": null,
                "createdAt": "2023-12-18T00:00:00",
                "checkoutAt": "2023-12-18T15:25:35.54",
                'items': 
                    [
                        //Quantidade: 16 (1 caixa + 4 unidades)
                        {
                            'externalSystemItemId': '971',
                            'name': 'Oleo Coamo',
                            'quantity': '16.000',
                            'packQuantity': '12.000',
                            'ean': '798239131',
                            'externalSystemAreaId': 'A001',
                            'price': 8.50
                        },
                        {
                            'externalSystemItemId': '34242',
                            'name': 'Feijão Caldo Bom',
                            'quantity': '16.000',
                            'packQuantity': '1.000',
                            'ean': '1214233212',
                            'externalSystemAreaId': 'A002',
                            'price': 6.99
                        }
                    ]
                },
                {
                    "externalSystemOrderId": "704545933",
                    "externalSystemPaymentTypeId": null,
                    "createdAt": "2023-12-18T00:00:00",
                    "checkoutAt": "2023-12-18T15:25:35.54",
                    'items': 
                    [
                        //Quantidade: 16 (1 caixa + 4 unidades)
                        {
                            'externalSystemItemId': '971',
                            'name': 'Oleo Coamo',
                            'quantity': '100.000',
                            'packQuantity': '12.000',
                            'ean': '798239131',
                            'externalSystemAreaId': 'A001',
                            'price': 8.50
                        },
                        {
                            'externalSystemItemId': '3920483209423',
                            'name': 'Bombom Coamo',
                            'quantity': '26.000',
                            'packQuantity': '12.000',
                            'ean': '798239131',
                            'externalSystemAreaId': 'A001',
                            'price': 8.50
                        },
                        {
                            'externalSystemItemId': '67657657',
                            'name': 'Bombom Coamo 2',
                            'quantity': '25.000',
                            'packQuantity': '12.000',
                            'ean': '798239131',
                            'externalSystemAreaId': 'A001',
                            'price': 8.50
                        },
                        {
                            'externalSystemItemId': '11111',
                            'name': 'Bombom Coamo',
                            'quantity': '5.000',
                            'packQuantity': '12.000',
                            'ean': '798239131',
                            'externalSystemAreaId': 'A001',
                            'price': 8.50
                        },
                        {
                            'externalSystemItemId': '564756',
                            'name': 'xxxx Coamo',
                            'quantity': '13.000',
                            'packQuantity': '12.000',
                            'ean': '798239131',
                            'externalSystemAreaId': 'A001',
                            'price': 8.50
                        },
                        {
                            'externalSystemItemId': '34242',
                            'name': 'Feijão Caldo Bom',
                            'quantity': '16.000',
                            'packQuantity': '1.000',
                            'ean': '1214233212',
                            'externalSystemAreaId': 'A002',
                            'price': 6.99
                        }
                    ]
                }
            ],

        }
    )

    const NavigatorContext = useContext(AppNavigatorContext);
	const selectedCompany: any = NavigatorContext.selectedCompany;
    
    return(
        <SafeAreaView style={{height: '100%', width: '100%', position: 'relative', backgroundColor:'#fff',paddingHorizontal: 10}}>
            {
              	budgetsState['budgets'].length === 0 ?
					<View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
						<Text  style={{fontSize: 16, color:"#000000"}}>
							Não há orçamentos pendentes!
						</Text>
					</View>
              	:
                    <View style={{flex:1}}>
                        <View style={{marginBottom: 10}}>
                            <Text style={{color:'#02044F', fontSize: 16, fontWeight: 'bold'}}>Loja {selectedCompany['company']}</Text>
                        </View>
                        <FlatList
                        showsVerticalScrollIndicator={true}
                        data={budgetsState['budgets']}
                        keyExtractor={(budgetId: any) => budgetsState['budgets']['externalSystemOrderId'] }
                        renderItem={ ({item: budget}: any) =>
                        {
                            return(
                               <Card
                                    mode="contained" 
                                    style={{marginBottom: 10, paddingVertical: 10, backgroundColor: '#ededed'}}	
                                >
                                    <Card.Content>
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
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
                                                <Text style={{color:'#000000', fontSize: 15}}>Orçamento #{budget['externalSystemOrderId']}</Text>
                                            </TouchableOpacity>
                                            <Text style={{color:'red', fontSize: 13}}>Pendente</Text>
                                        </View>
                                    </Card.Content>
                               </Card>
                            );
                        }}
                    />
                </View>
            }
        </SafeAreaView>
    );
}

export default Budgets;