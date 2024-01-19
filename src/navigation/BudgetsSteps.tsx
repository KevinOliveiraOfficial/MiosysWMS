import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BudgetsDescription from "../menu/BudgetsDescription";
import ScanBarcode from "../menu/ScanBarcode";

export type BudgetsStepsStackNavigatorParamList = {
    BudgetsDescription:{
        budget: any;
    };   
    ScanBarcode: {
        externalSystemOrderItem: any;
    };
};
  
const BudgetsStepsStackNavigator = createNativeStackNavigator<BudgetsStepsStackNavigatorParamList>();
  
 
const BudgetsSteps= () => {
    return(
        <BudgetsStepsStackNavigator.Navigator 
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

            <BudgetsStepsStackNavigator.Screen name="BudgetsDescription" component={BudgetsDescription} options={{headerShown: true, title: 'Descrição do Orçamento'}}/>

            <BudgetsStepsStackNavigator.Screen name="ScanBarcode" component={ScanBarcode} options={{headerShown: false, title: 'Descrição do Orçamento'}}/>
        
        {/*<RegisterOrderStackNavigator.Screen name="registerOrderSelectProducts" component={} options={{headerShown: true, title: 'Selecione os produtos'}} />*/}
  
        </BudgetsStepsStackNavigator.Navigator>
    );
  };
  
  
  export default BudgetsSteps;