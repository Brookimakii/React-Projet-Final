import {Button, View} from "react-native";

function AudioRecorder(props) {
  return null;
}

export default function RecordScreen({ navigation, route  }) {
  const [audioFile, setAudioFile] = useState(null);

  const handleRecordingComplete = (file) => {
    setAudioFile(file);
  };

  const goToRaveScreen = () => {
    if (audioFile) {
      navigation.navigate('RAVE', { audioFile, serverIp: route.params.serverIp });
    } else {
      alert('Please record an audio clip first');
    }
  };

  return (
    <View style={styles.container}>
      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
      {audioFile && <Button title="Proceed to RAVE" onPress={goToRaveScreen} />}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});