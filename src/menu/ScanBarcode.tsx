import { CompositeScreenProps } from "@react-navigation/native";
import { Alert, SafeAreaView } from "react-native";
import { BudgetsStepsStackNavigatorParamList } from "../navigation/BudgetsSteps";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppStack";

import * as REA from 'react-native-reanimated';
import { Camera, useCameraDevices, useFrameProcessor, Frame, useCameraPermission, useCameraDevice } from 'react-native-vision-camera';


type screenProps = CompositeScreenProps<
  NativeStackScreenProps<BudgetsStepsStackNavigatorParamList, 'ScanBarcode'>,
  NativeStackScreenProps<AppStackParamList>
>;


function ScanBarcode({route, navigation}: screenProps)
{
    const { hasPermission, requestPermission } = useCameraPermission();

    if (hasPermission == false) {
        requestPermission();
    }

    const device = useCameraDevice('back')

    if (device == null) return Alert.alert('erro');
    return(
        <SafeAreaView>
            <Camera
                //style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
            />
        </SafeAreaView>
    )
}

export default ScanBarcode;