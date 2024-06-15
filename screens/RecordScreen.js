import {Button, FlatList, TextInput, View} from "react-native";
import {useState, useEffect } from "react";
import {useNavigation} from "@react-navigation/native";
import {Audio} from 'expo-av';

function AudioRecorder(props) {
  return null;
}

export default function RecordScreen() {

  const [sound, setSound] = useState();
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [recordingUri, setRecordingUri] = useState();
  const [isRecording, setIsRecording] = useState(false);

  const [recordingName, setRecordingName] = useState('');
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    loadRecordings();
  }, []);
  useEffect(() => {
    return sound? () => {
      // Libérer la mémoire allouée à l'audio précédent
      console.log('Unloading sound...')
      sound.unloadAsync();
    }: undefined;
  }, [sound])

  const loadRecordings = async () => {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    setRecordings(files);
  };

  async function startRecording() {
    try {
      // Demander la permission d'accéder au micro
      if (permissionResponse.status !== 'granted') {
        await requestPermission();
      }
      // Autoriser enregistrement iOS
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: true
      });
      // Commencer l'enregistrement
      const {recording} = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      setRecording(recording);
    }
    catch (err) {
      console.error(err);
    }
  }

  async function stopRecording() {
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false
    })
    const uri = recording.getURI()
    setRecordingUri(uri);
    setRecording(undefined);
  }

  async function playSound() {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true
    })
    const { sound } = await Audio.Sound.createAsync({uri:recordingUri});
    setSound(sound);
    console.log('Playing sound...');
    await sound.playAsync();
  }
  async function saveRecording(){
    if (recordingUri && recordingName) {
      const newFileUri = `${FileSystem.documentDirectory}${recordingName}.wav`;
      await FileSystem.moveAsync({
        from: recordingUri,
        to: newFileUri,
      });
      loadRecordings();
      setRecordingName('');
      setRecordingUri(null);
    } else {
      alert('Please enter a name for the recording');
    }
  };
  const deleteRecording = async (uri) => {
    try {
      await FileSystem.deleteAsync(uri);
      loadRecordings();
    } catch (err) {
      console.error('Failed to delete recording', err);
    }
  };

  async function changeRecordingStatus() {
    if (!isRecording) {
      startRecording();
    }
    else {
      stopRecording();
    }
    setIsRecording(!isRecording);
  }

  return (
    <View style={styles.container}>
      <Button title={recording ? 'Stop Recording' : 'Start Recording'} onPress={recording ? stopRecording : startRecording} />
      {recordingUri && (
        <>
          <Button title="Play Recording" onPress={() => playSound(recordingUri)} />
          <TextInput
            style={styles.input}
            placeholder="Enter recording name"
            value={recordingName}
            onChangeText={setRecordingName}
          />
          <Button title="Save Recording" onPress={saveRecording} />
        </>
      )}
      <FlatList
        data={recordings}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.recordingItem}>
            <Text>{item}</Text>
            <View style={styles.recordingActions}>
              <Button title="Play" onPress={() => playSound(`${FileSystem.documentDirectory}${item}`)} />
              <Button title="Delete" onPress={() => deleteRecording(`${FileSystem.documentDirectory}${item}`)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    marginVertical: 16,
  },
  recordingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  recordingActions: {
    flexDirection: 'row',
  },
});