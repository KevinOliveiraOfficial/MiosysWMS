import { CommonActions, CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { OrderStepsStackNavigatorParamList } from "../navigation/OrderSteps";
import { AppStackParamList } from "../navigation/AppStack";
import MaterialIcons from 'react-native-vector-icons/FontAwesome6';
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Code, useCameraDevice, useCameraPermission, useCodeScanner } from "react-native-vision-camera";
import { DrawerNavigatorParamList } from "../navigation/DrawerNavigation";
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
  NativeStackScreenProps<DrawerNavigatorParamList>
>;

function OrdersDescription({route, navigation}: screenProps)
{
	const order = route.params.order;
    const [scannedItems, setScannedItems] = useState<any[]>([]);

    // Camera states
    const { hasPermission, requestPermission } = useCameraPermission();
    const [externalSystemOrderItemToBeScanned, setExternalSystemOrderItemToBeScanned] = useState<any>(null);
    const [isCameraInitialized, setIsCameraInitialized] = useState<boolean>(false);
    const [cameraActive, setCameraActive] = useState<boolean>(Platform.OS === 'ios');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [inputQuantityValue, setInputQuantityValue] = useState<string>('');
    const inputRef = useRef<any>();

    // Get back camera
    const device = useCameraDevice('back');

    useEffect(() =>
    {
        if ( device )
            requestPermission();
    }, []);

    const addScannedItem = useCallback(( externalSystemOrderItemAux: any, quantity: number | null ) =>
    {
        const externalSystemOrderItem = {...externalSystemOrderItemAux};
        setScannedItems((_prev: any) =>
        {
            let prev = [..._prev];
            const index = prev.findIndex( (k: any) => k['externalSystemOrderItemId'] === externalSystemOrderItem['externalSystemOrderItemId'] );

            // If item not found
            if ( index < 0 && quantity !== null )
            {
                externalSystemOrderItem['scannedQuantity'] = quantity;
                return [externalSystemOrderItem, ...prev];
            }
            else
            {
                if ( (prev[index]['scannedQuantity'] === 0.0 && quantity === 0.0) || quantity === null )
                    prev.splice( index, 1 );
                else
                    prev[index]['scannedQuantity'] = quantity;
            }

            return prev;
        });
    }, []);

    const onInitialized = useCallback(() => {
        setIsCameraInitialized(true);
        //setCameraActive(true);
    }, []);

    const onCodeScannedCallback = useCallback((codes: Code[]) =>
    {
        codes.forEach( ( code: Code ) =>
        {
            if ( externalSystemOrderItemToBeScanned['externalSystemItem']['ean'] === code.value)
            {
                setCameraActive(false);
                setShowModal(true);
            }
        });
    }, [externalSystemOrderItemToBeScanned]);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: onCodeScannedCallback
    });

    useEffect(() =>
    {
        if (Platform.OS === 'ios')
        {
            return () => {};
        }
  
        //let timeout: NodeJS.Timeout;
        if (hasPermission && isCameraInitialized) {
            setCameraActive(true);
            //timeout = setTimeout(() => setCameraActive(true), 2000);
        }
    
        return () =>
        {
            //clearTimeout(timeout);
        };
    }, [hasPermission, isCameraInitialized]);


    useEffect(() =>
    {
        if ( externalSystemOrderItemToBeScanned !== null || showModal == true )
        {
            navigation.setOptions({headerShown: false});
        }
        else
        {
            navigation.setOptions({headerShown: true});
        }
    }, [externalSystemOrderItemToBeScanned, showModal]);


    const canShowAlert = useRef(true);

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
            else if (scannedItems.length !== 0)
            {
                if ( canShowAlert.current === false )
                    return;

                canShowAlert.current = false;
                Alert.alert(
                    'Tem certeza que deseja abandonar?',
                    'Você perderá os itens escaneados e suas alterações não serão salvas.',
                    [
                        {
                            text: 'Cancelar',
                            style: 'cancel',
                            onPress: () => canShowAlert.current = true
                        },
                        {
                            text: 'Sim',
                            style: 'default',
                            onPress: () => {
                                navigation.dispatch(e.data.action);
                            }
                        }
                    ]
                );
                return;
            }
            else
            {
                navigation.dispatch(e.data.action);
            }
        };
        navigation.addListener('beforeRemove', onBackPress);


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

            if ( isCameraInitialized )
            {
                setCameraActive(false);
            }
            navigation.removeListener('beforeRemove', onBackPress);
        };
    }, [navigation, externalSystemOrderItemToBeScanned, scannedItems]));

    if ( externalSystemOrderItemToBeScanned !== null )
    {
        const externalSystemItem = externalSystemOrderItemToBeScanned['externalSystemItem'];
        const quantity = parseFloat(externalSystemOrderItemToBeScanned['quantity']);
        const quantityText = inputNumberFormatter(quantity.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);

        const packQuantity = parseFloat(externalSystemItem['packQuantity']);
        const packQuantityText = inputNumberFormatter(packQuantity.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);
        let collectPack = 0.0;
        let collectUnity = 0.0;

        if ( packQuantity === 1.0 )
        {
            collectUnity = quantity;
        }
        else
        {
            collectPack = quantity;
        }

        const collectUnityText = inputNumberFormatter(collectUnity.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);
        const collectPackText = inputNumberFormatter(collectPack.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);
        const collectText = collectPack > 0.0 ? (`${collectPackText} fardo` + (collectPack > 1.0 ? "s" : "")) : (`${collectUnityText} fardo` + (collectUnity > 1.0 ? "s" : ""));

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
                                <View style={{ marginBottom: 10 }}>  
                                    <Text style={{fontWeight: 'bold', color:'#000000', fontSize: 17, marginBottom: 5, textAlign: 'center'}}>{externalSystemItem['name']}</Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Código: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['externalSystemItemId']}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000'}}><MaterialIcons name="barcode" size={16} color="#000000" solid /> EAN: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['ean']}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Quantidade contida no fardo: <Text style={{fontWeight: 'normal', color:'#000000'}}>{packQuantityText}</Text></Text>
                                </View>
                                <View
                                    style={{
                                        backgroundColor: '#edebe6',
                                        padding: 15,
                                        borderRadius: 20,
                                        marginBottom: 20,
                                    }}
                                >
                                    <Text style={{fontWeight: 'bold', color:'#000000', textAlign: 'center'}}><MaterialIcons name="location-dot" size={16} color="#000000" solid /> Ponto de coleta: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemOrderItemToBeScanned['spot']}</Text></Text>
                                    <Text style={{marginTop: 10, fontWeight: 'bold', color:'#000000', textAlign: 'center', }}>Necessário Coletar: <Text style={{fontWeight: 'normal', color:'#000000'}}>{collectText}</Text></Text>
                                </View>
                                <View>
                                    <Text  style={{alignSelf: 'center', color: "#000000", marginTop:10, fontWeight: "bold"}}>
                                    Definir quantidade coletada 
                                    </Text>
                                    <TextInput
                                        style={{borderBottomWidth:1, borderColor: '#868691', paddingBottom:0, marginBottom:0, color: "#000000"}}
                                        placeholder='Informe a quantidade...'
                                        placeholderTextColor={'#868691'}
                                        onChangeText={(inputValue: string) => setInputQuantityValue(inputNumberFormatter(inputValue, 2, false)) }
                                        value={inputQuantityValue}
                                        defaultValue={inputQuantityValue}
                                        keyboardType="numeric"
                                        textAlign='center'
                                        ref={inputRef}
                                        autoFocus={false}
                                        onLayout={ () => {
                                            setTimeout(() => {
                                                inputRef?.current?.focus();
                                            }, 100);
                                        }}
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
                                        
                                        const newQuantity = inputQuantityValue.length === 0 ? null : getNumberFromFormatter(inputQuantityValue);

                                        if ( newQuantity === null )
                                        {
                                            Alert.alert("Quantidade não informada", "Por favor, informe a quantidade!");
                                            return;
                                        }

                                        addScannedItem( externalSystemOrderItemToBeScanned, newQuantity );

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
                <View style={{flex: 3, position: "relative"}}>
                    {
                    device &&
                    <Camera
                        video={false}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={cameraActive}
                        onInitialized={onInitialized}
                        onError={(error) => {
                            console.log(error);
                        }}
                        codeScanner={codeScanner}
                    />
                    }
                </View>
                <View style={{flex: 1, padding: 10, marginHorizontal: 10, position: "relative"}}>
                    <View style={{ marginBottom: 10}}>  
                        <Text style={{fontWeight: 'bold', color:'#000000', fontSize: 17, marginBottom: 5, textAlign: 'center'}}>{externalSystemItem['name']}</Text>
                        <Text style={{fontWeight: 'bold', color:'#000000',}}>Código: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['externalSystemItemId']}</Text></Text>
                        <Text style={{fontWeight: 'bold', color:'#000000'}}><MaterialIcons name="barcode" size={16} color="#000000" solid /> EAN: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['ean']}</Text></Text>
                        <Text style={{fontWeight: 'bold', color:'#000000',}}>Quantidade contida no fardo: <Text style={{fontWeight: 'normal', color:'#000000'}}>{packQuantityText}</Text></Text>
                    </View>
                    <View
                        style={{
                            backgroundColor: '#edebe6',
                            padding: 15,
                            borderRadius: 20
                        }}
                    >
                        <Text style={{fontWeight: 'bold', color:'#000000', textAlign: 'center'}}><MaterialIcons name="location-dot" size={16} color="#000000" solid /> Ponto de coleta: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemOrderItemToBeScanned['spot']}</Text></Text>
                        <Text style={{marginTop: 10, fontWeight: 'bold', color:'#000000', textAlign: 'center', }}>Necessário Coletar: <Text style={{fontWeight: 'normal', color:'#000000'}}>{collectText}</Text></Text>
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
                    data={order['externalSystemOrderItems']}
                    //extraData={itemsExtraData}
                    style={{}}
                    keyExtractor={(orderId: any) => orderId['externalSystemOrderItemId']}
                    renderItem={ ({item: externalSystemOrderItem}: any) =>
                    {
                        const externalSystemItemScannedQuantityNode = scannedItems.find( (k: any) => k['externalSystemOrderItemId'] === externalSystemOrderItem['externalSystemOrderItemId']);
                        const scannedQuantity = externalSystemItemScannedQuantityNode?.['scannedQuantity'] ?? undefined; 

                        const externalSystemItem = externalSystemOrderItem['externalSystemItem'];
                        const quantity = parseFloat(externalSystemOrderItem['quantity']);
                        const quantityText = inputNumberFormatter(quantity.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);

                        const packQuantity = parseFloat(externalSystemItem['packQuantity']);
                        const packQuantityText = inputNumberFormatter(packQuantity.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);
                        let collectPack = 0.0;
                        let collectUnity = 0.0;

                        if ( packQuantity === 1.0 )
                        {
                            collectUnity = quantity;
                        }
                        else
                        {
                            collectPack = quantity;
                        }

                        const collectUnityText = inputNumberFormatter(collectUnity.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);
                        const collectPackText = inputNumberFormatter(collectPack.toFixed(2).replace(/[^\d+-]/g, ""), 2, true);
                        const collectText = collectPack > 0.0 ? (`${collectPackText} fardo` + (collectPack > 1.0 ? "s" : "")) : (`${collectUnityText} fardo` + (collectUnity > 1.0 ? "s" : ""));

                        return(

                            <View
                                style={{
                                    backgroundColor: scannedQuantity === undefined ? "#ffffff" : scannedQuantity === 0.0 ? '#fc9595' : '#bdfcc1',
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
                                    borderColor: scannedQuantity === undefined ? '#e3e3e3' : scannedQuantity === 0.0 ? '#fc9595' : '#bdfcc1',
                                    flex: 1,
                                    position: "relative"
                                }}
                            >
                                <View style={{ marginBottom: 10}}>  
                                    <Text style={{fontWeight: 'bold', color:'#000000', fontSize: 17, marginBottom: 5, textAlign: 'center'}}>{externalSystemItem['name']}</Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Código: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['externalSystemItemId']}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000'}}><MaterialIcons name="barcode" size={16} color="#000000" solid /> EAN: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemItem['ean']}</Text></Text>
                                    <Text style={{fontWeight: 'bold', color:'#000000',}}>Quantidade contida no fardo: <Text style={{fontWeight: 'normal', color:'#000000'}}>{packQuantityText}</Text></Text>
                                </View>
                                <View
                                    style={{
                                        backgroundColor: scannedQuantity === undefined ? '#edebe6' : scannedQuantity === 0.0 ? '#e7736a' : '#a8e2ac',
                                        padding: 15,
                                        borderRadius: 20,
                                        marginBottom: 10
                                    }}
                                >
                                    <Text style={{fontWeight: 'bold', color:'#000000', textAlign: 'center'}}><MaterialIcons name="location-dot" size={16} color="#000000" solid /> Ponto de coleta: <Text style={{fontWeight: 'normal', color:'#000000'}}>{externalSystemOrderItem['spot']}</Text></Text>
                                    <Text style={{marginTop: 10, fontWeight: 'bold', color:'#000000', textAlign: 'center', }}>Necessário Coletar: <Text style={{fontWeight: 'normal', color:'#000000'}}>{collectText}</Text></Text>
                                    {
                                    scannedQuantity !== undefined &&
                                    <View>
                                        <Text style={{fontWeight: 'bold', color:'#000000', textAlign: "center"}}>Quantidade coletada: <Text style={{fontWeight: 'normal', color:'#000000'}}>{inputNumberFormatter((scannedQuantity ?? 0.0).toFixed(2).replace(/[^\d+-]/g, ""), 2, true)}</Text></Text>
                                    </View>
                                    }
                                </View>

                                {
                                scannedQuantity === undefined ?
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                                    <TouchableOpacity
                                        style={{
                                            padding: 15,
                                            borderRadius: 10,
                                            backgroundColor: scannedQuantity === 0.0 ? '#d43226' : '#4c5159',
                                            width: "49%"
                                        }}
                                        onPress={() => 
                                        {
                                            addScannedItem( externalSystemOrderItem, 0.0 );
                                        }}
                                    >
                                        <View style={{ flex: 1, flexDirection: 'row', position: 'relative', justifyContent: 'center', alignItems: "center"}}>
                                            <MaterialIcons name="ban" size={16} color="#FFFFFF" solid />
                                            <Text style={{ marginLeft: 5, color: '#FFFFFF', fontSize: 12}}>Marcar sem estoque</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            padding: 15,
                                            borderRadius: 10,
                                            backgroundColor: '#312cd1',
                                            width: "49%"                                    
                                        }}
                                        onPress={() =>
                                        {
                                            externalSystemOrderItem['externalSystemItem']['ean'] = '7898043362390';
                                            setInputQuantityValue('');
                                            setExternalSystemOrderItemToBeScanned(externalSystemOrderItem);
                                        }}
                                    >
                                        <View style={{ flex: 1, flexDirection: 'row', position: 'relative', justifyContent: 'center', alignItems: "center"}}>
                                            <MaterialIcons name="barcode" size={17} color="#FFFFFF" solid />
                                            <Text style={{ marginLeft: 5, color: '#FFFFFF', fontSize: 12}}>Escanear</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                :
                                <View style={{flex: 1, marginTop: 10}}>
                                    {
                                    scannedQuantity === 0.0 ?
                                    <TouchableOpacity
                                        style={{
                                            padding: 15,
                                            borderRadius: 10,
                                            backgroundColor: scannedQuantity === 0.0 ? '#d43226' : '#4c5159'
                                        }}
                                        onPress={() => 
                                        {
                                            if ( scannedQuantity !== undefined && scannedQuantity !== 0.0 )
                                                addScannedItem( externalSystemOrderItem, null );
                                            else
                                                addScannedItem( externalSystemOrderItem, 0.0 );
                                        }}
                                    >
                                        <View style={{ flex: 1, flexDirection: 'row', position: 'relative', justifyContent: 'center', alignItems: "center"}}>
                                            <MaterialIcons name="ban" size={16} color="#FFFFFF" solid />
                                            <Text style={{ marginLeft: 5, color: '#FFFFFF', fontSize: 12}}>{
                                            (scannedQuantity === 0.0 ? "Desmarcar sem estoque" : "Marcar sem estoque")}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity
                                        style={{
                                            padding: 15,
                                            borderRadius: 10,
                                            backgroundColor: '#d43226'
                                        }}
                                        onPress={() => 
                                        {
                                            Alert.alert('Remover quantidade coletada', 'Tem certeza que deseja remover a quantidade coletada?',
                                            [
                                                {
                                                    text: 'Cancelar',
                                                    style: 'cancel'
                                                },
                                                {
                                                    text: 'Sim',
                                                    onPress: () => 
                                                    {
                                                        addScannedItem( externalSystemOrderItem, null );
                                                    },
                                                    style: 'default'
                                                }
                                            ]);
                                        }}
                                    >
                                        <View style={{ flex: 1, flexDirection: 'row', position: 'relative', justifyContent: 'center', alignItems: "center"}}>
                                            <MaterialIcons name="trash" size={16} color="#FFFFFF" solid />
                                            <Text style={{ marginLeft: 5, color: '#FFFFFF', fontSize: 12}}>Remover quantidade coletada</Text>
                                        </View>
                                    </TouchableOpacity>
                                    }
                                </View>
                                }
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
                                    padding: 15,               
                                }}
                                onPress={() => 
                                {
                                    let isAllItemsScanned: boolean = true;
                                    order['externalSystemOrderItems'].every( (externalSystemOrderItem: any, index: number) =>
                                    {
                                        const find = scannedItems.find( (k: any) => k['externalSystemOrderItemId'] === externalSystemOrderItem['externalSystemOrderItemId'] );
                                        if ( find === undefined )
                                        {
                                            isAllItemsScanned = false;
                                            return false;
                                        }
                                        return true;
                                    });
                                    if ( isAllItemsScanned === true )
                                    {
                                        Alert.alert('Tem certeza que deseja sincronizar?', 'Sua coleta será enviada ao sistema.',
                                        [
                                            {
                                                text: 'Cancelar',
                                                style: 'cancel'
                                            },
                                            {
                                                text: 'Sincronizar',
                                                onPress: () => 
                                                {
                                                    navigation.navigate("SyncOrderItemsScreen", {
                                                        order: order,
                                                        scannedExternalSystemOrderItems: scannedItems
                                                    });
                                                },
                                                style: 'default'
                                            }
                                        ]);
                                    }
                                    else
                                    {
                                        Alert.alert('Coleta incompleta', 'Parece que a sua coleta está incompleta. Verifique os itens em branco!',
                                        [
                                            {
                                                text: 'OK',
                                                style: 'default'
                                            }
                                        ]); 
                                    }
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