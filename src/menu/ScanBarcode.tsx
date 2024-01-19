import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, Alert, Image, Modal, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { BudgetsStepsStackNavigatorParamList } from "../navigation/BudgetsSteps";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppStack";

import Icon from "react-native-vector-icons/FontAwesome6";
import { useCallback, useEffect, useState } from "react";
import { Camera, useCameraDevice, useCodeScanner, useCameraPermission, Code } from 'react-native-vision-camera';
type screenProps = CompositeScreenProps<
    NativeStackScreenProps<BudgetsStepsStackNavigatorParamList, 'ScanBarcode'>,
    NativeStackScreenProps<AppStackParamList>
>;

function ScanBarcode({route, navigation}: screenProps)
{
    const externalSystemOrderItem = route.params.externalSystemOrderItem;
    externalSystemOrderItem['ean'] = "7894900504002";

    const { hasPermission, requestPermission } = useCameraPermission();

    // States
    const [screenIsFocused, setScreenIsFocused] = useState<boolean>(false);
    const [isCameraInitialized, setIsCameraInitialized] = useState<boolean>(false);
    const [cameraActive, setCameraActive] = useState<boolean>(Platform.OS === 'ios');
    const [showModal, setShowModal] = useState<boolean>(false);

    // Get back camera
    const device = useCameraDevice('back');

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: (codes: Code[]) =>
        {
            codes.forEach( ( code: Code ) =>
            {
                if ( externalSystemOrderItem['ean'] === code.value)
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
        if ( device )
            requestPermission();
    }, []);

    const onInitialized = () => {
        setIsCameraInitialized(true);
    };

    useEffect(() =>
    {
        if (Platform.OS === 'ios')
        {
            return () => {};
        }
  
        let timeout: NodeJS.Timeout;
        if (hasPermission && isCameraInitialized) {
            setCameraActive(true)
            //timeout = setTimeout(() => setCameraActive(true), 2000);
        }
    
        return () =>
        {
            //clearTimeout(timeout);
        };
    }, [hasPermission, isCameraInitialized]);

    useFocusEffect(useCallback(() =>
    {
        console.log('FOCUS DETECTEDx');
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
        };
    }, []));

    const isDarkMode = useColorScheme() === 'dark';
    if (device == null)
        return (
            <View
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1
            }}>
                <Text style={{ fontWeight: "bold", fontSize: 18, color: "#737373", textAlign: "center", marginBottom: 20}}>Câmera não detectada.</Text>
            </View>
        );

    if ( showModal === false )
    {
        return (
        <SafeAreaView
            style={StyleSheet.absoluteFill}
        >
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
        </SafeAreaView>);
    }
       
    return (
    <SafeAreaView
        style={StyleSheet.absoluteFill}
    >
        <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={isDarkMode ? '#545454' : '#FFFFFF'}
        />
        <View
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 2
            }}
        >
            <Modal
                visible={showModal}
                animationType={"slide" || "none"}
                transparent={true}
            >
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
                >
                    <View
                        style={{ 
                            marginVertical: 10,
                            backgroundColor: 'white',
                            borderRadius: 20,
                            shadowColor: '#000',
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 4,
                            elevation: 5,
                            width: "95%",
                            //height: 'auto',
                            padding: 20,
                            position: "relative",
                        }}
                    >
                        <View style={{ position: "relative" }}>
                            <View style={{ alignItems: 'center', marginTop: 15 }}>
                                <View style={{ position: 'relative', width: 60, height: 60 }}>
                                    <Image style={{ width: "100%", height: "100%",  borderColor: "#000", }} source={require("../assets/images/barcode_scan.png")} />
                                </View>
                            </View>
                            <View style={{ marginBottom: 10, alignItems: 'center' }}>
                                <View style={{  position: "relative", flexDirection: 'row'}}>
                                    <Text style={{ fontWeight: "bold", color: "#000000"}}>Código: </Text>
                                    <Text style={{ fontWeight: "normal", color: "#000000"}}>{externalSystemOrderItem['externalSystemItemId']}</Text>
                                </View>
                                <View style={{ position: "relative", flexDirection: 'row'}}>   
                                    <Text style={{ fontWeight: "bold", color: "#000000"}}>EAN: </Text>
                                    <Text style={{ fontWeight: "normal", color: "#000000"}}>{externalSystemOrderItem['ean']}</Text>
                                </View>
                            </View>
                            <View style={{ marginBottom: 20, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontWeight: "bold", color: "#000000"}}><Text style={{ fontWeight: "normal", color: "#000000"}}>{externalSystemOrderItem['name']}</Text></Text>
                            </View>
                            <TouchableOpacity
                                style={{
                                    width: "100%",
                                    height: 50,
                                    backgroundColor: "#bf41b1",
                                    marginBottom: 10,
                                    padding: 15, 
                                    borderRadius: 10,
                                }}
                                onPress= { () =>
                                {
                   
                                }}
                            >
                                <View style={{ flex: 1, position: 'relative'}}>
                                    <View style={{ flex: 1, flexDirection: 'row', position: 'relative', justifyContent: 'center'}}>
                                        <Icon name="circle-plus" size={20} color="#FFFFFF" solid />
                                        <Text style={{ marginLeft: 5, color: '#FFFFFF'}}>Adicionar</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    width: "100%",
                                    height: 50,
                                    backgroundColor: "#6c757d",
                                    padding: 15, 
                                    borderRadius: 10,
                                }}
                                onPress= { () =>
                                {
                                    setShowModal(false);
                                    setCameraActive(true);
                                }}
                            >
                                <View style={{ flex: 1, position: 'relative'}}>
                                    <View style={{ flex: 1, flexDirection: 'row', position: 'relative', justifyContent: 'center'}}>
                                        <Text style={{ marginLeft: 5, color: '#FFFFFF'}}>Cancelar</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    </SafeAreaView>
    );
}

export default ScanBarcode;