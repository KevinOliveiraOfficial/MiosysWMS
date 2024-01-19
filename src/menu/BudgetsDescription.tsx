import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { BudgetsStepsStackNavigatorParamList } from "../navigation/BudgetsSteps";
import { AppStackParamList } from "../navigation/AppStack";
import { Card, Icon } from "react-native-paper";
import MaterialIcons from 'react-native-vector-icons/FontAwesome6';
import { useState } from "react";
import {Button } from '@rneui/themed';

type screenProps = CompositeScreenProps<
  NativeStackScreenProps<BudgetsStepsStackNavigatorParamList, 'BudgetsDescription'>,
  NativeStackScreenProps<AppStackParamList>
>;

function BudgetsDescription({route, navigation}: screenProps)
{
	const budget = route.params.budget;
	//console.log('BBBBBBBBBBBBBBBBUDGET', budget['externalSystemOrderItems'])
	const [checkOnPress, setCheckOnPress] = useState(false);
	const [itemsExtraData, setItemsExtraData] = useState(false);
	const [items, setItems] = useState(budget['externalSystemOrderItems']);
	
	console.log(budget)
    return(
        <SafeAreaView style={{height: '100%', width: '100%', position: 'relative', backgroundColor:'#fff',padding: 10}}>
          	
			<View style={{flex: 1,}}>
				<Text style={{fontWeight: 'bold', color:'#000000', fontSize: 17, marginBottom: 5, textAlign: 'center'}}>Orçamento #{budget['externalSystemOrderId']} </Text>

				<View style={{flex:5}}>
					<FlatList
						showsVerticalScrollIndicator={false}
						data={items}
						extraData={itemsExtraData}
						style={{}}
						keyExtractor={(budgetId: any) => budgetId['externalSystemOrderItemId']}
						renderItem={ ({item: externalSystemOrderItem}: any) =>
						{
							const externalSystemItem = externalSystemOrderItem['externalSystemItem'];
							//item['checkOnPress'] = false;
							const quantity = parseFloat(externalSystemOrderItem['quantity']);
							const packQuantity = parseFloat(externalSystemItem['packQuantity']);
							let collectPack = 0;
							let collectUnity = 0;
							if ((quantity % packQuantity) === 0.0)
							{
								if ( packQuantity === 1.0 )
									collectUnity = quantity / packQuantity;
								else
									collectPack = quantity / packQuantity;
							}
							else
							{
								collectPack = Math.trunc(quantity / packQuantity);
								collectUnity = quantity - (collectPack * packQuantity);			
							}
							return(

								<View style={{flex: 2,}}>
								
									<Card
										mode="contained" 
										style={{marginBottom: 10, backgroundColor: '#ededed'}}	
									>
										<Card.Content>
											<View style={{}}>
												
												<Text style={{fontWeight: 'bold', color:'#000000', fontSize: 17, marginBottom: 5, textAlign: 'center'}}>{externalSystemItem['name']}</Text>
												<Text style={{fontWeight: 'bold', color:'#000000',}}>Código: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['externalSystemItemId']}</Text></Text>
												<Text style={{fontWeight: 'bold', color:'#000000',}}>Ean: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['ean']}</Text></Text>
												<Text style={{fontWeight: 'bold', color:'#000000',}}>Local: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemOrderItem['spot']}</Text></Text>
												<Text style={{fontWeight: 'bold', color:'#000000',}}>Quantidade: <Text style={{fontWeight: 'normal', color:'#000000'}}> {externalSystemOrderItem['quantity']}</Text></Text>
												<Text style={{fontWeight: 'bold', color:'#000000',}}>Embalagem: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['packQuantity']}</Text></Text>
												<Text style={{fontWeight: 'bold', color:'#000000',}}>Coletar: <Text style={{fontWeight: 'normal', color:'#000000'}}>{collectPack === 0 ? `${collectUnity} unidade${collectUnity > 1 ? 's' : ''}` : `${collectPack} caixa${collectPack > 1 ? 's' : ''} + ${collectUnity} unidade${collectUnity > 1 ? 's' : ''}`}</Text></Text>
											</View>
											<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
												<TouchableOpacity
													style={{
														padding: 10,
														paddingHorizontal: 15,
														borderRadius: 10,
														marginLeft: 5,
														//backgroundColor: '#d43226',
														marginTop: 10,
														backgroundColor: (externalSystemOrderItem['checkOnPress'] ?? false) ? '#d43226' : '#4c5159'
														
												
													}}
													//disabled={ syncingPendingOrders.includes(order['pendingOrderId']) }
													onPress={() => 
													{
														setItems( (prev: any) => 
														{
															return prev.map((itemMap: any) =>
															{
																if ( itemMap['externalSystemOrderItemId'] === externalSystemOrderItem['externalSystemOrderItemId'] )
																{
																	itemMap['checkOnPress'] = !(itemMap['checkOnPress'] ?? false);
																}
																
																return itemMap;
															});
														});
														setItemsExtraData( prev => !prev );
													}
														
													}
												>
													<View style={{ flex: 1, flexDirection: 'row', position: 'relative', justifyContent: 'center'}}>
														<MaterialIcons name="ban" size={16} color="#FFFFFF" solid />
														<Text style={{ marginLeft: 5, color: '#FFFFFF'}}>Sem Estoque</Text>
													</View>
												</TouchableOpacity>
												<TouchableOpacity
													style={{
														padding: 10,
														paddingHorizontal: 15,
														borderRadius: 10,
														marginLeft: 5,
														backgroundColor: '#312cd1',
														marginTop: 10
														//backgroundColor: syncingPendingOrders.includes(order['pendingOrderId']) === true ? 'rgba(2, 4, 79, 0.5)' : 'rgba(2, 4, 79, 1)'

												
													}}
													//disabled={ syncingPendingOrders.includes(order['pendingOrderId']) }
													onPress={() => 
														navigation.navigate('BudgetsSteps', {
															screen: 'ScanBarcode',
															params: {
																externalSystemOrderItem: externalSystemOrderItem
															}
														})
													}
												>
													<View style={{ flex: 1, flexDirection: 'row', position: 'relative', justifyContent: 'center'}}>
														<MaterialIcons name="barcode" size={17} color="#FFFFFF" solid />
														<Text style={{ marginLeft: 5, color: '#FFFFFF'}}>Escanear</Text>
													</View>
												</TouchableOpacity>
											</View>
											
										</Card.Content>
									</Card>
								</View>

							);
						}}
					/>
				</View>
				<View style={{}}>
					<TouchableOpacity
						style={{
							padding: 10,
							paddingHorizontal: 15,
							borderRadius: 10,
							marginLeft: 5,
							backgroundColor: 'green',
							marginTop: 10,
							width:"100%",
							height: 40,
							alignItems: "center"
							//backgroundColor: syncingPendingOrders.includes(order['pendingOrderId']) === true ? 'rgba(2, 4, 79, 0.5)' : 'rgba(2, 4, 79, 1)'

					
						}}
						//disabled={ syncingPendingOrders.includes(order['pendingOrderId']) }
						onPress={() => 
							
							{}
						}
					>
						<View style={{ flex: 1, flexDirection: 'row', position: 'relative', justifyContent: 'center'}}>
							<MaterialIcons name="rotate" size={17} color="#FFFFFF" solid />
							<Text style={{ marginLeft: 5, color: '#FFFFFF'}}>Sincronizar</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
        </SafeAreaView>
    );
}

export default BudgetsDescription;