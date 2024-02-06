import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OrdersDescription from "../menu/OrderDescription";
import SyncOrderItemsScreen from "../menu/SyncOrderItemsScreen";
import ScanBarcode from "../menu/ScanBarcode";

export type OrderStepsStackNavigatorParamList = {
    OrdersDescription:{
        order: any;
    };
    SyncOrderItemsScreen: {
        scannedExternalSystemOrderItems: any[];
    };
    ScanBarcode: {
        externalSystemOrderItem: any;
    };
};
  
const OrderStepsStackNavigator = createNativeStackNavigator<OrderStepsStackNavigatorParamList>();
  
 
const OrderSteps= () => {
    return(
        <OrderStepsStackNavigator.Navigator 
            screenOptions={{
            headerShown:false, 
            headerTransparent:false, 
            headerTitleStyle:{fontSize: 18},
            headerShadowVisible: false,
            headerTitleAlign:'center',
            headerTintColor: '#02044F',
            headerStyle: {
                backgroundColor: '#fff',
        
                },
            }}>

            <OrderStepsStackNavigator.Screen name="OrdersDescription" component={OrdersDescription} options={{headerShown: true, title: 'Descrição do Pedido'}}/>
            <OrderStepsStackNavigator.Screen name="SyncOrderItemsScreen" component={SyncOrderItemsScreen} options={{headerShown: false, title: 'Sincronizando...'}}/>

            <OrderStepsStackNavigator.Screen name="ScanBarcode" component={ScanBarcode} options={{headerShown: false, title: 'Escanear Item do Pedido'}}/>
        
        {/*<RegisterOrderStackNavigator.Screen name="registerOrderSelectProducts" component={} options={{headerShown: true, title: 'Selecione os produtos'}} />*/}
  
        </OrderStepsStackNavigator.Navigator>
    );
  };
  
  
  export default OrderSteps;