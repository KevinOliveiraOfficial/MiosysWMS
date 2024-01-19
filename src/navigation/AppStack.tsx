import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createContext, useEffect, useRef, useState } from "react";

import DrawerNavigation from "./DrawerNavigation";
import BudgetsSteps from "./BudgetsSteps";
import { RootStackParamList } from '../../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventEmitter } from "eventemitter3";

export const event = new EventEmitter();

export type AppStackParamList = {
    Drawer: any;
    BudgetsSteps: any;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigatorContext = createContext({
    selectedSalesForceWMSUser: {} 
});

const AppStack = ({route}: NativeStackScreenProps<RootStackParamList, 'AppStack'>) =>
{
    return(
        <AppNavigatorContext.Provider
            value={{
                "selectedSalesForceWMSUser": route.params?.selectedSalesForceWMSUser ?? {}
            }}        
        >
            <Stack.Navigator initialRouteName={"Drawer"} screenOptions={{headerShown:false}}>
                <Stack.Screen name='Drawer' component={DrawerNavigation}/>
                <Stack.Screen name='BudgetsSteps' component={BudgetsSteps}  />
            </Stack.Navigator>
	    </AppNavigatorContext.Provider>
    )
}

export default AppStack;