import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function RecordScreen({ navigation, route  }) {
  // State variables for managing audio recording and playback
  const [sound, setSound] = useState();
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [recordingUri, setRecordingUri] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const [recordings, setRecordings] = useState([]);
  
  // Load existing recordings when the component mounts
  useEffect(() => {
    loadRecordings();
  }, []);

  // Clean up sound resources when the component unmounts
  useEffect(() => {
    return sound ? () => {
      // Free up the Memory from previous audio
      sound.unloadAsync();
    } : undefined;
  }, [sound]);

  // Function to load recordings from the file system
  const loadRecordings = async () => {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    setRecordings(files);
  };

  // Function to start recording audio
  const startRecording = async () => {
    try {
      // Ask for permissions to access mic
      if (permissionResponse.status !== 'granted') {
        await requestPermission();
      }
      // Allows recordings on IOS
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: true
      });
      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Function to stop recording audio
  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false
      });
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(undefined);
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  // Function to play a recorded audio file
  const playSound = async (uri) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true
      });
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      await sound.playAsync();
    } catch (err) {
      console.error('Failed to play sound', err);
    }
  };

  // Function to save a recorded audio file with a user-provided name
  const saveRecording = async () => {
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

  // Function to delete a recorded audio file
  const deleteRecording = async (uri) => {
    try {
      await FileSystem.deleteAsync(uri);
      loadRecordings();
    } catch (err) {
      console.error('Failed to delete recording', err);
    }
  };

  // Toggle recording state (start/stop recording)
  const changeRecordingStatus = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <View style={styles.container}>
      {/* Recording button */}
      <Button title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={changeRecordingStatus} />
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
      <Button
        title="Go to Rave"
        onPress={() => navigation.navigate('Rave', { serverIp: 'your_server_ip', serverPort: 'your_server_port' })}
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