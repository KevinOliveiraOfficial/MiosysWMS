import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './Login';

export type AuthStackNavigatorParamList = {
    Login: any;
};

const AuthStackNavigator = createNativeStackNavigator();

const AuthStack = () => {
    return(
        <AuthStackNavigator.Navigator screenOptions={{headerShown: false}}>
            <AuthStackNavigator.Screen name="Login" component={Login} />
        </AuthStackNavigator.Navigator>
    );
};

export default AuthStack;