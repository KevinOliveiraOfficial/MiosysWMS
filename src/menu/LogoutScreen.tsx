import { CompositeScreenProps, useFocusEffect, CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { OrderStepsStackNavigatorParamList } from "../navigation/OrderSteps";
import MaterialIcons from 'react-native-vector-icons/FontAwesome6';
import { DrawerNavigatorParamList } from "../navigation/DrawerNavigation";


function LogoutScreen({route, navigation}: NativeStackScreenProps<DrawerNavigatorParamList, 'LogoutScreen'>)
{
	return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
        <View style={{flex: 1}}>
            <TouchableOpacity
                    style={{
                        backgroundColor: '#088c0f',
                        borderRadius: 12,
                        padding:15,

                
                    }}
                    onPress={() => 
                    {
                        
                    }}
                >
                    <View style={{ flex: 1}}>
                        <MaterialIcons name="rotate" size={17} color="#FFFFFF" solid />
                        <Text style={{ marginLeft: 5, color: '#FFFFFF', fontSize: 12}}>Sair</Text>
                    </View>
                </TouchableOpacity>
        </View>
    </SafeAreaView>
    );
}

export default LogoutScreen;