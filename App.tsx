import 'react-native-gesture-handler';
import React from 'react';

import {
  SafeAreaView, View, Text
} from 'react-native';

import AuthStack from './src/login/AuthStack';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigatorScreenParams} from '@react-navigation/native';

import {AuthStackNavigatorParamList} from './src/login/AuthStack';
import AppStack, { AppStackParamList } from './src/navigation/AppStack';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackNavigatorParamList>;
  AppStack: NavigatorScreenParams<AppStackParamList>;
  
};

function APISDK( this: any )
{
    let _this = this;
    this.BASEURL = "http://192.168.50.9:9091/api/v1";
    this.userId = null;
    this.authorization = null;
    this.me = null;

    this.init = ( userId: string, authorization: string ) =>
    {
        _this.userId = userId;
        _this.authorization = authorization;
    };


    this.api = async ( method: any, route: any, params: any, callback: Function, abortController?: AbortController ) => 
    {     
        const headers: {[k: string]: any} = {
            'Accept': 'application/json'
        };

        if ( method === 'GET' || method === 'DELETE' )
            route = `${route}?${(new URLSearchParams(params)).toString()}`;
        else if ( method === 'POST' || method === 'PUT' )
        {
            headers['Content-Type'] = 'application/json; charset=UTF-8';
            params = JSON.stringify(params);
        }
        console.log('API CALLED, METHOD', method, 'route', route, 'host', _this.BASEURL);

        if ( _this.authorization !== null )
            headers['Authorization'] = _this.authorization;
        
        if ( _this.userId !== null )
            headers['User-Id'] = _this.userId;

        const response = await fetch( `${_this.BASEURL}${route}`,
        {
            'signal': abortController?.signal,
            'method': method,
            'headers': headers,
            'body': method === 'POST' || method === 'PUT' ? params : undefined
            //'body': method === 'POST' ? formBodyStr : undefined
        })
        .then(response => {
            const statusCode = response.status;
            const data = response.json();
            return Promise.all([statusCode, data]);
        })
        .then(([status, data]) : any => {
            callback?.( status, data );
        })
        .catch(error => {
            //console.error(error);
            console.log(error);
            return { name: "network error", description: "" };
        });
    };
};

export var API = new (APISDK as any)();

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): JSX.Element {
  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName={"Auth"}>
        <Stack.Screen name="AppStack" component={AppStack} options={{ headerShown: false }} initialParams={{ screen: "Drawer" }} />
          <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} initialParams={{ screen: "Login" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App;
