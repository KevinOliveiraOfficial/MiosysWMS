import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OrdersDescription from "../menu/OrderDescription";
import ScanBarcode from "../menu/ScanBarcode";

export type OrderStepsStackNavigatorParamList = {
    OrdersDescription:{
        order: any;
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

            <OrderStepsStackNavigator.Screen name="OrdersDescription" component={OrdersDescription} options={{headerShown: true, title: 'Descrição do Orçamento'}}/>

            <OrderStepsStackNavigator.Screen name="ScanBarcode" component={ScanBarcode} options={{headerShown: false, title: 'Descrição do Orçamento'}}/>
        
        {/*<RegisterOrderStackNavigator.Screen name="registerOrderSelectProducts" component={} options={{headerShown: true, title: 'Selecione os produtos'}} />*/}
  
        </OrderStepsStackNavigator.Navigator>
    );
  };
  
  
  export default OrderSteps;