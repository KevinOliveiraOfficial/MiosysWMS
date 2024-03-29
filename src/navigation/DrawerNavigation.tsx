import { createDrawerNavigator } from '@react-navigation/drawer';
import Orders from '../menu/Orders';
import LogoutScreen from '../menu/LogoutScreen';
export type DrawerNavigatorParamList = {
    Orders: any | {
        syncedOrder: any;
    };
    LogoutScreen: any;
};

const Drawer = createDrawerNavigator<DrawerNavigatorParamList>();

function DrawerNavigation()
{
    return (
        <Drawer.Navigator initialRouteName={"Orders"} screenOptions={{
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
			<Drawer.Screen name="Orders" component={Orders} options={{ title: "Pedidos", headerShown:true}} />
            <Drawer.Screen name="LogoutScreen" component={LogoutScreen} options={{ title: "Sair", headerShown:true}} /> 
      </Drawer.Navigator>
    );
};

export default DrawerNavigation;