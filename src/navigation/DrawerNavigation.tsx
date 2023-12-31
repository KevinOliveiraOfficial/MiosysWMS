import { createDrawerNavigator } from '@react-navigation/drawer';
import Budgets from '../menu/Budgets';

export type DrawerNavigatorParamList = {
    Budgets: any;
};

const Drawer = createDrawerNavigator<DrawerNavigatorParamList>();

function DrawerNavigation()
{
    return (
        <Drawer.Navigator initialRouteName={"Budgets"} screenOptions={{
          headerShown:false, 
          headerTransparent:false, 
          headerTitleStyle:{fontSize: 18},
          headerTitleAlign:'center',
          headerTintColor: '#02044F',
          drawerActiveTintColor: '#02044F',
          headerStyle: {
              backgroundColor: '#fff',
              elevation: 0,
              shadowOpacity: 0
            },
            
          drawerLabelStyle:{
            marginLeft:10,
            fontFamily: 'notoserif',
            fontSize:15,
            color:'#02044F',
            //fontWeight:'500'
          }
        }}>
			<Drawer.Screen name="Budgets" component={Budgets} options={{ title: "Orçamentos", headerShown:true}}/> 
      
      </Drawer.Navigator>
    );
};

export default DrawerNavigation;