import { CompositeScreenProps, useFocusEffect, CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { OrderStepsStackNavigatorParamList } from "../navigation/OrderSteps";
import MaterialIcons from 'react-native-vector-icons/FontAwesome6';
import { DrawerNavigatorParamList } from "../navigation/DrawerNavigation";
import { useCallback, useContext, useEffect, useRef } from "react";
import { API } from "../../App";
import { AppNavigatorContext } from "../navigation/AppStack";

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
  NativeStackScreenProps<OrderStepsStackNavigatorParamList, 'SyncOrderItemsScreen'>,
  NativeStackScreenProps<DrawerNavigatorParamList>
>;

const SyncOrderItemsScreen = ({route, navigation}: screenProps) =>
{
    const NavigatorContext = useContext(AppNavigatorContext);
    const selectedSalesForceWMSUser: any = NavigatorContext.selectedSalesForceWMSUser;
    const controller = useRef<AbortController>(new AbortController());

    useFocusEffect(useCallback(() =>
    {
        console.log('SyncOrderItemsScreen FOCUS DETECTED');

        const onBackPress = (e: any) => 
        {
            // Prevent default behavior of leaving the screen
            e.preventDefault();

            return;
        };

        //navigation.addListener('beforeRemove', onBackPress);
        
        return () =>
        {
            // Do something that should run on blur
            console.log('SyncOrderItemsScreen BLUR DETECTED');

            //navigation.removeListener('beforeRemove', onBackPress);
        };
    }, [navigation]));

    useEffect(() =>
    {
        
        const request = 
        {
            "sales_force_wms_user_id": selectedSalesForceWMSUser['salesForceWMSUserId'],
            "external_system_order_items": route.params.scannedExternalSystemOrderItems.map( (k: any) => ({
                "external_system_order_item_id": k['externalSystemOrderItemId'],
                "external_system_item_id": k['externalSystemItem']['externalSystemItemId'],
                "quantity": k['scannedQuantity'].toFixed(3)
            }))
        };
        console.log(request);

        /*
        API.api('GET', `/sales-force/wms/orders/collect`, request, ( status: number, response: any ) =>
        {
            if ( status === 200 )
            {

            }
        }, controller.current );*/

        return () =>
        {
            // Cancel the request before component unmounts
            controller.current.abort();
        };
    }, []);
	return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <View
                style={{
                    flexDirection: 'row',
                    position: 'relative',
                    justifyContent: 'center',
                }}
            >
                <ActivityIndicator size="small" color="#000000" />
                <Text style={{ marginLeft: 5, color: '#000000'}}>Sincronizando...</Text>
            </View>
        </View>
    </SafeAreaView>
    );
}

export default SyncOrderItemsScreen;