import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { OrderStepsStackNavigatorParamList } from "../navigation/OrderSteps";
import { AppStackParamList } from "../navigation/AppStack";
import MaterialIcons from 'react-native-vector-icons/FontAwesome6';
import { useCallback, useEffect, useState } from "react";
import { Camera, Code, useCameraDevice, useCameraPermission, useCodeScanner } from "react-native-vision-camera";
export const getNumberFromFormatter = ( currentInputValue: string ): number | null => 
{
    currentInputValue = currentInputValue.trim();

    if ( currentInputValue.length === 0 )
        return null;

    const firstChar = currentInputValue[0];

    // Check if is signed input
    const signal = (firstChar === "+" || firstChar === "-") ? firstChar : "";

    currentInputValue = currentInputValue.replaceAll(".", "").replaceAll(",", ".");

    // Get only numbers from string (replace everything thats not a digit or dot)
    const inputNumbers = currentInputValue.replace(/[^\d.]/g, "");

    if ( inputNumbers.length === 0 )
        return null;

    const result = parseFloat(signal.concat(inputNumbers));

    return result === -0 ? 0 : result;
};

export const inputNumberFormatter = ( currentInputValue: string, decimalPlaces: number, allowNegative: boolean ): string => 
{
    decimalPlaces = Math.trunc(decimalPlaces);
    currentInputValue = currentInputValue.trim();

    if ( currentInputValue.length === 0 )
        return currentInputValue;

    const firstChar = currentInputValue[0];
    if ( currentInputValue.length === 1 )
    {
        // if not a digit
        if ( /^\d+$/.test(firstChar) === false )
        {
            return firstChar;
        }
    }

    const signal = (firstChar === "+" || firstChar === "-") ? (firstChar === "-" && allowNegative === false ? "" : firstChar) : "";

    const inputNumbers = currentInputValue.replace(/\D/g, "");

    if ( inputNumbers.length <= decimalPlaces )
        return signal.concat(inputNumbers);

    const intPart = parseInt(inputNumbers.slice(0, -decimalPlaces));
    
    const intPartStr = intPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const decimalPart = inputNumbers.slice(-decimalPlaces);

    return signal.concat(intPartStr, ",", decimalPart);
};

const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        //marginTop: 22,
        marginHorizontal: 10,
    },
    modalView: {
        width: "100%",
        height: 400,
        //margin: 20,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        position: "relative"
    },
});

type screenProps = CompositeScreenProps<
  NativeStackScreenProps<OrderStepsStackNavigatorParamList, 'OrdersDescription'>,
  NativeStackScreenProps<AppStackParamList>
>;

function OrdersDescription({route, navigation}: screenProps)
{
	const order = route.params.order;
	//const [itemsExtraData, setItemsExtraData] = useState<boolean>(false);
	const [items, setItems] = useState<any[]>([]);

    // Camera states
    const { hasPermission, requestPermission } = useCameraPermission();
    const [externalSystemOrderItemToBeScanned, setExternalSystemOrderItemToBeScanned] = useState<any>(null);
    const [screenIsFocused, setScreenIsFocused] = useState<boolean>(false);
    const [isCameraInitialized, setIsCameraInitialized] = useState<boolean>(false);
    const [cameraActive, setCameraActive] = useState<boolean>(Platform.OS === 'ios');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [inputQuantityValue, setInputQuantityValue] = useState<string>('');

    // Get back camera
    const device = useCameraDevice('back');

    useEffect(() =>
    {
        if ( device )
            requestPermission();

        setItems(order['externalSystemOrderItems'].map( (k: any) => {
            k['scannedQuantity'] = null;
            return k;
        }));

    }, []);

    const onInitialized = () => {
        setIsCameraInitialized(true);
    };

    const getExternalSystemOrderItemToBeScanned = useCallback(() => externalSystemOrderItemToBeScanned, [externalSystemOrderItemToBeScanned]);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: (codes: Code[]) =>
        {
            let tmp = getExternalSystemOrderItemToBeScanned();
            console.log('tmppp', tmp);
            codes.forEach( ( code: Code ) =>
            {
                if ( tmp['externalSystemItem']['ean'] === code.value)
                {
                    setCameraActive(false);
                    setShowModal(true);
                }
                console.log(code.value);
            });
        }
    });

    useEffect(() =>
    {
        if (Platform.OS === 'ios')
        {
            return () => {};
        }
  
        //let timeout: NodeJS.Timeout;
        if (hasPermission && isCameraInitialized) {
            setCameraActive(true)
            //timeout = setTimeout(() => setCameraActive(true), 2000);
        }
    
        return () =>
        {
            //clearTimeout(timeout);
        };
    }, [hasPermission, isCameraInitialized]);


    useEffect(() => {

        if ( externalSystemOrderItemToBeScanned !== null || showModal == true )
        {
            navigation.setOptions({headerShown: false});
        }
        else
        navigation.setOptions({headerShown: true});
    }, [externalSystemOrderItemToBeScanned, showModal]);

    useFocusEffect(useCallback(() =>
    {
        console.log('FOCUS DETECTEDx');

        const onBackPress = (e: any) => 
        {
            // Prevent default behavior of leaving the screen
            e.preventDefault();

            if ( externalSystemOrderItemToBeScanned !== null )
            {
                setExternalSystemOrderItemToBeScanned(null);
                return;
            }
            else
            {
                navigation.dispatch(e.data.action);
            }
        };
        navigation.addListener('beforeRemove', onBackPress);

        
        setScreenIsFocused(true);

        if ( showModal === false )
        {
            if ( hasPermission && isCameraInitialized )
            {
                setCameraActive(true);
            }
        }

        return () =>
        {
            // Do something that should run on blur
            console.log('BLUR DETECTED');

            setScreenIsFocused(false);
            if ( isCameraInitialized )
            {
                setCameraActive(false);
            }
            navigation.removeListener('beforeRemove', onBackPress);
        };
    }, [navigation, externalSystemOrderItemToBeScanned]));

    if ( externalSystemOrderItemToBeScanned !== null )
    {
        const externalSystemItem = externalSystemOrderItemToBeScanned['externalSystemItem'];
        const quantity = parseFloat(externalSystemOrderItemToBeScanned['quantity']);
        const quantityText = inputNumberFormatter(quantity.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);

        const packQuantity = parseFloat(externalSystemItem['packQuantity']);
        const packQuantityText = inputNumberFormatter(packQuantity.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);
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

        const collectUnityText = inputNumberFormatter(collectUnity.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);
        return (
        <SafeAreaView style={StyleSheet.absoluteFill}>
            {
                showModal === true ?
                <Modal
                visible={showModal}
                animationType={"slide"}
                transparent={true}
            >
                <View style={modalStyles.modalOverlay}>
                    <View style={modalStyles.centeredView}>
                        <View style={modalStyles.modalView}>
                            <View style={{ width: "100%", flex: 1}}>
                                <View style={{marginBottom: 20, paddingBottom: 10, borderBottomWidth:1, borderColor: '#868691',}}>           
                                    <Text style={{fontWeight: 'bold', color:'#000000', fontSize: 17, marginBottom: 5, textAlign: 'center'}}>{externalSystemItem['name']}</Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Código: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['externalSystemItemId']}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Ean: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['ean']}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Local: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemOrderItemToBeScanned['spot']}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Quantidade: <Text style={{fontWeight: 'normal', color:'#000000'}}>{quantityText}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Embalagem: <Text style={{fontWeight: 'normal', color:'#000000'}}>{packQuantityText}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Coletar: <Text style={{fontWeight: 'normal', color:'#000000'}}>{collectPack === 0 ? `${collectUnityText} unidade${collectUnity > 1 ? 's' : ''}` : `${collectPack} caixa${collectPack > 1 ? 's' : ''} + ${collectUnityText} unidade${collectUnity > 1 ? 's' : ''}`}</Text></Text>
                                </View>
                                <View>
                                    <Text  style={{alignSelf: 'center', color: "#000000", marginTop:10, fontWeight: "bold"}}>
                                    Definir quantidade coletada 
                                    </Text>
                                    <TextInput
                                        style={{borderBottomWidth:1, borderColor: '#868691', paddingBottom:0, marginBottom:0, color: "#000000"}}
                                        //placeholder='Digite a quantidade...'
                                        placeholderTextColor={'#000000'}
                                        onChangeText={(inputValue: string) => setInputQuantityValue(inputNumberFormatter(inputValue, 2, false)) }
                                        value={inputQuantityValue}
                                        defaultValue={inputQuantityValue}
                                        keyboardType="numeric"
                                        textAlign='center'
                                    />
                                </View>
                            </View>
                            <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between"}}>
                                <TouchableOpacity
                                    onPress={() =>
                                    {  
                                        setShowModal(false);
                                        setExternalSystemOrderItemToBeScanned(null);
                                    }} 
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderWidth: 1,
                                        borderColor: "#02044F",
                                        padding:10, 
                                        borderRadius:10,
                                        width: "49%"
                                    }}
                                >
                                    <Text style={{
                                        textAlign: 'center',
                                        fontSize: 14,
                                        color: '#02044F', 
                                    }}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() =>
                                    {
                                        const newQuantity = inputQuantityValue.length === 0 ? 0.0 : getNumberFromFormatter(inputQuantityValue);

                                        setItems( (prev: any) => 
                                        {
                                            return prev.map((itemMap: any) =>
                                            {
                                                if ( itemMap['externalSystemOrderItemId'] === externalSystemOrderItemToBeScanned['externalSystemOrderItemId'] )
                                                {
                                                    itemMap['scannedQuantity'] = newQuantity;
                                                }
                                                
                                                return itemMap;
                                            });
                                        });

                                        setShowModal(false);
                                        setExternalSystemOrderItemToBeScanned(null);
                                    }} 
                                    style={{
                                        backgroundColor: '#02044F',
                                        borderWidth: 1,
                                        borderColor: "#02044F",
                                        padding:10, 
                                        borderRadius:10,
                                        width: "49%"
                                    }}
                                >
                                    <Text style={{
                                        textAlign: 'center',
                                        fontSize: 14,
                                        color: '#FFFFFF', 
                                    }}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            :
            <View style={{flex:1, backgroundColor:'#ffffff', position: "relative"}}>
                <View style={{flex: 4, position: "relative"}}>
                    {
                    device &&
                    <Camera
                        video={false}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={cameraActive && screenIsFocused && isCameraInitialized}
                        onInitialized={onInitialized}
                        onError={(error) => {
                            console.log(error);
                        }}
                        codeScanner={codeScanner}
                    />
                    }
                </View>
                <View style={{flex: 1, padding: 10, marginHorizontal: 10, position: "relative"}}>
                    <View>           
                        <Text style={{fontWeight: 'bold', color:'#000000', fontSize: 17, marginBottom: 5, textAlign: 'center'}}>{externalSystemItem['name']}</Text>
                        <Text style={{fontWeight: 'bold', color:'#000000',}}>Código: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['externalSystemItemId']}</Text></Text>
                        <Text style={{fontWeight: 'bold', color:'#000000',}}>Ean: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['ean']}</Text></Text>
                        <Text style={{fontWeight: 'bold', color:'#000000',}}>Local: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemOrderItemToBeScanned['spot']}</Text></Text>
                        <Text style={{fontWeight: 'bold', color:'#000000',}}>Quantidade: <Text style={{fontWeight: 'normal', color:'#000000'}}>{quantityText}</Text></Text>
                        <Text style={{fontWeight: 'bold', color:'#000000',}}>Embalagem: <Text style={{fontWeight: 'normal', color:'#000000'}}>{packQuantityText}</Text></Text>
                        <Text style={{fontWeight: 'bold', color:'#000000',}}>Coletar: <Text style={{fontWeight: 'normal', color:'#000000'}}>{collectPack === 0 ? `${collectUnityText} unidade${collectUnity > 1 ? 's' : ''}` : `${collectPack} caixa${collectPack > 1 ? 's' : ''} + ${collectUnityText} unidade${collectUnity > 1 ? 's' : ''}`}</Text></Text>
                    </View>
                    <View style={{ marginVertical: 20}}>
                        <ActivityIndicator size="small" color="#0000ff" style={{marginBottom: 5}} />
                        <Text style={{color: "#000000",  textAlign: "center"}}>Aguardando escaneamento do código de barras...</Text>
                    </View>
                </View>
                <View style={{flex: 1, paddingVertical: 10, margin: 10, justifyContent: "flex-end" }}>
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#4c5159',
                            borderRadius: 12,
                            padding: 15,
                        }}
                        onPress={() => 
                        {
                            setExternalSystemOrderItemToBeScanned(null);
                        }}
                    >
                        <Text style={{ color: '#FFFFFF', textAlign: "center"}}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
            }
        </SafeAreaView>);
    }
	
    return(
        <SafeAreaView style={StyleSheet.absoluteFill}>
			<View style={{flex: 1, backgroundColor: "#ffffff"}}>
				<Text style={{fontWeight: 'bold', color:'#000000', fontSize: 17, marginVertical: 5, textAlign: 'center'}}>Pedido #{order['externalSystemOrderId']} </Text>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={items}
                    //extraData={itemsExtraData}
                    style={{}}
                    keyExtractor={(orderId: any) => orderId['externalSystemOrderItemId']}
                    renderItem={ ({item: externalSystemOrderItem}: any) =>
                    {
                        const externalSystemItem = externalSystemOrderItem['externalSystemItem'];
                        //item['scannedQuantity'] = false;
                        const quantity = parseFloat(externalSystemOrderItem['quantity']);
                        const quantityText = inputNumberFormatter(quantity.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);

                        const packQuantity = parseFloat(externalSystemItem['packQuantity']);
                        const packQuantityText = inputNumberFormatter(packQuantity.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);
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

                        const collectUnityText = inputNumberFormatter(collectUnity.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);
                        return(

                            <View
                                style={{
                                    backgroundColor: externalSystemOrderItem['scannedQuantity'] === 0.0 ? '#fc9595' : '#ffffff',
                                    paddingHorizontal: 10,
                                    paddingVertical: 15,
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
                                    borderColor: externalSystemOrderItem['scannedQuantity'] === 0.0 ? '#fc9595' : '#e3e3e3',
                                    flex: 1,
                                    position: "relative"
                                }}
                            >
                                <View style={{ marginBottom: 10}}>
                                    
                                    <Text style={{fontWeight: 'bold', color:'#000000', fontSize: 17, marginBottom: 5, textAlign: 'center'}}>{externalSystemItem['name']}</Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Código: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['externalSystemItemId']}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>EAN: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['ean']}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Local: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemOrderItem['spot']}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Quantidade: <Text style={{fontWeight: 'normal', color:'#000000'}}>{quantityText}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Embalagem: <Text style={{fontWeight: 'normal', color:'#000000'}}>{packQuantityText}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Coletar: <Text style={{fontWeight: 'normal', color:'#000000'}}>{collectPack === 0 ? `${collectUnityText} unidade${collectUnity > 1 ? 's' : ''}` : `${collectPack} caixa${collectPack > 1 ? 's' : ''} + ${collectUnityText} unidade${collectUnity > 1 ? 's' : ''}`}</Text></Text>
                                </View>
                                <View>
                                    <Text style={{fontWeight: 'bold', color:'#000000', textAlign: "center"}}>Quantidade coletada: <Text style={{fontWeight: 'normal', color:'#000000'}}>{inputNumberFormatter((externalSystemOrderItem['scannedQuantity'] ?? 0.0).toFixed(2).replace(/[^\d+-]/g, ""), 2, true)}</Text></Text>
                                </View>
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10,}}>
                                    <TouchableOpacity
                                        style={{
                                            padding: 10,
                                            paddingHorizontal: 15,
                                            borderRadius: 10,
                                            //backgroundColor: '#d43226',
                                            backgroundColor: externalSystemOrderItem['scannedQuantity'] === 0.0 ? '#d43226' : '#4c5159',
                                            width: "49%"
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
                                                        console.log("FFFOUND");
                                                        itemMap['scannedQuantity'] = itemMap['scannedQuantity'] === null ? 0.0 : null;
                                                    }
                                                    
                                                    return itemMap;
                                                });
                                            });
                                            //setItemsExtraData( prev => !prev );
                                        }
                                            
                                        }
                                    >
                                        <View style={{ flex: 1, flexDirection: 'row', position: 'relative', justifyContent: 'center'}}>
                                            <MaterialIcons name="ban" size={16} color="#FFFFFF" solid />
                                            <Text style={{ marginLeft: 5, color: '#FFFFFF'}}>Marcar sem estoque</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            padding: 10,
                                            paddingHorizontal: 15,
                                            borderRadius: 10,
                                            backgroundColor: '#312cd1',
                                            width: "49%"
                                            //backgroundColor: syncingPendingOrders.includes(order['pendingOrderId']) === true ? 'rgba(2, 4, 79, 0.5)' : 'rgba(2, 4, 79, 1)'

                                    
                                        }}
                                        //disabled={ syncingPendingOrders.includes(order['pendingOrderId']) }
                                        onPress={() =>
                                        {
                                            /*navigation.navigate('OrderSteps', {
                                                screen: 'ScanBarcode',
                                                params: {
                                                    externalSystemOrderItem: externalSystemOrderItem
                                                }
                                            })*/

                                            externalSystemOrderItem['externalSystemItem']['ean'] = '7891150060883';
                                            setInputQuantityValue('');
                                            setExternalSystemOrderItemToBeScanned(externalSystemOrderItem);
                                        }}
                                    >
                                        <View style={{ flex: 1, flexDirection: 'row', position: 'relative', justifyContent: 'center'}}>
                                            <MaterialIcons name="barcode" size={17} color="#FFFFFF" solid />
                                            <Text style={{ marginLeft: 5, color: '#FFFFFF'}}>Escanear</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        );
                    }}
                    ListFooterComponent=
                    {
                        <View style={{marginVertical: 10, marginHorizontal: 10}}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#088c0f',
                                    borderRadius: 12,
                                    padding:15, 
                                    //backgroundColor: syncingPendingOrders.includes(order['pendingOrderId']) === true ? 'rgba(2, 4, 79, 0.5)' : 'rgba(2, 4, 79, 1)'

                            
                                }}
                                //disabled={ syncingPendingOrders.includes(order['pendingOrderId']) }
                                onPress={() => 
                                {
                                    console.log(items.map( (k: any) => {
                                        return {
                                            external_system_order_item_id: k['externalSystemOrderItemId'],
                                            external_system_item_id: k['externalSystemItem']['externalSystemItemId'],
		                                    quantity: (k['scannedQuantity'] ?? 0.0).toFixed(3)
                                        };
                                    }));
                                }}
                            >
                                <View style={{ flex: 1, flexDirection: 'row', position: 'relative', justifyContent: 'center'}}>
                                    <MaterialIcons name="rotate" size={17} color="#FFFFFF" solid />
                                    <Text style={{ marginLeft: 5, color: '#FFFFFF'}}>Sincronizar</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
                />
			</View>
        </SafeAreaView>
    );
}

export default OrdersDescription;