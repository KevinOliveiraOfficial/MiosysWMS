import { CompositeScreenProps } from '@react-navigation/native';
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {Text, SafeAreaView, View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, FlatList, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { DrawerNavigatorParamList } from '../navigation/DrawerNavigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppNavigatorContext, AppStackParamList } from '../navigation/AppStack';
import {RootStackParamList, API} from '../../App';
import Moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/FontAwesome6';

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
  NativeStackScreenProps<DrawerNavigatorParamList, 'FriendRequestsScreen'>,
  NativeStackScreenProps<AppStackParamList>
>;

const FriendRequests = ({ navigation}: screenProps): React.JSX.Element => 
{
    const [friendRequests, setFriendRequests] = useState([
        {
            "friendRequestId": 999,
            "fromUser": {
                "userId": 1,
                "name": "Nickolas Crema",
                "userPhoto": ""
            },
            "createdAt": "2024-02-01T00:16:00.000+00:00"
        },
        {
            "friendRequestId": 193042,
            "fromUser": {
                "userId": 40,
                "name": "Italo Gavassi",
                "userPhoto": ""
            },
            "createdAt": "2024-01-31T22:00:00.000+00:00"
        },
        {
            "friendRequestId": 24325351,
            "fromUser": {
                "userId": 1,
                "name": "Nickolas Crema",
                "userPhoto": ""
            },
            "createdAt": "2024-02-01T00:16:00.000+00:00"
        },
        {
            "friendRequestId": 9793534,
            "fromUser": {
                "userId": 40,
                "name": "Italo Gavassi",
                "userPhoto": ""
            },
            "createdAt": "2024-01-31T22:00:00.000+00:00"
        },
        {
            "friendRequestId": 3532546,
            "fromUser": {
                "userId": 1,
                "name": "Nickolas Crema",
                "userPhoto": ""
            },
            "createdAt": "2024-02-01T00:16:00.000+00:00"
        },
        {
            "friendRequestId": 123122,
            "fromUser": {
                "userId": 40,
                "name": "Italo Gavassi",
                "userPhoto": ""
            },
            "createdAt": "2024-01-31T22:00:00.000+00:00"
        }
    ]);

    const [confirmFriendRequestInfo, setConfirmFriendRequestInfo] = useState<any>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
        <Modal
            animationType="slide"
            transparent={true}
            visible={showModal}
        >
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.centeredView}>
                    <View style={modalStyles.modalView}>
                        <Text style={{fontWeight: "bold", marginBottom: 20}}>Recusar solicitação de amizade?</Text>
                        {
                            confirmFriendRequestInfo !== null &&
                            <View style={{ flex: 1, flexDirection: "row", position: "relative" }}>
                                <View style={{width: 50, height: 50, backgroundColor: "#ff36c6", borderRadius: 30}}></View>
                                <View style={{flex: 1, marginLeft: 10}}>
                                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                                        <Text style={{fontWeight: "bold", marginLeft: 10}}>{confirmFriendRequestInfo['fromUser']['name']}</Text>
                                        <View>
                                            <Text>5 min atrás</Text>
                                        </View>
                                    </View>
                                    <View style={{marginTop: 10, flexDirection: "row", justifyContent: "space-between"}}>
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: "#e5e7e9",
                                                padding: 10,
                                                borderRadius: 20,
                                                width: "49%",
                                            }}
                                            onPress={() =>
                                            {
                                                setConfirmFriendRequestInfo(null);
                                                setShowModal(false);
                                            }}
                                        >
                                            <Text style={{ color: "#000000", textAlign: "center" }}>Cancelar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: "#1b74e4",
                                                padding: 10,
                                                borderRadius: 20,
                                                width: "49%",
                                            }}
                                        >
                                            <Text style={{ color: "#ffffff", textAlign: "center" }}>Confirmar</Text>
                                        </TouchableOpacity>
                                        
                                    </View>
                                </View>
                            </View>
                        }
                    </View>
                </View>
            </View>
        </Modal>
        <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <View style={{ marginTop: 10, marginHorizontal: 10, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#707070", paddingBottom: 10, marginBottom: 10 }}>
                <MaterialIcons 
                    name='user-plus' 
                    size={20} 
                    color='#707070' 
                />
                <Text style={{ marginLeft: 5, color: "#707070", fontSize: 16, fontWeight: "bold" }}>{friendRequests.length} Solicitações de Amizade</Text>
            </View>
            <FlatList
                style={{ marginTop: 5 }}
                data={friendRequests}
                keyExtractor={ (friendRequest: any) => friendRequest['friendRequestId'] }
                ListHeaderComponent={
                    <View>
                        <Text>TODAS AS SOLICITAÇÕES</Text>
                    </View>
                }
                ListFooterComponent={
                    <View>
                        <Text>TODAS AS SOLICITAÇÕES</Text>
                    </View>
                }
                renderItem={ ({item: friendRequest}: any) =>
                {
                    return (
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#ffffff",
                                marginHorizontal: 10,
                                marginBottom: 15,
                                padding: 20,
                                elevation: 9,
                                borderWidth: 1,
                                borderColor: "#e5e5e5"
                            }}
                        >
                            <View style={{ flex: 1, flexDirection: "row", position: "relative" }}>
                                <View style={{width: 50, height: 50, backgroundColor: "#ff36c6", borderRadius: 30}}></View>
                                <View style={{flex: 1, marginLeft: 10}}>
                                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                                        <Text style={{fontWeight: "bold", marginLeft: 10}}>{friendRequest['fromUser']['name']}</Text>
                                        <View>
                                            <Text>5 min atrás</Text>
                                        </View>
                                    </View>
                                    <View style={{marginTop: 10, flexDirection: "row", justifyContent: "space-between"}}>
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: "#1b74e4",
                                                padding: 10,
                                                borderRadius: 20,
                                                width: "49%"
                                            }}
                                        >
                                            <Text style={{ color: "#ffffff", textAlign: "center" }}>Confirmar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: "#e5e7e9",
                                                padding: 10,
                                                borderRadius: 20,
                                                width: "49%"
                                            }}
                                            onPress={() =>
                                            {
                                                setConfirmFriendRequestInfo(friendRequest);
                                                setShowModal(true);
                                            }}
                                        >
                                            <Text style={{ color: "#000000", textAlign: "center" }}>Excluir</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    </SafeAreaView>
    );
};
export default FriendRequests;