import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

export default function RaveScreen({ route }) {
  // Extract server IP and port from route parameters
  const { serverIp, serverPort } = route.params;
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [transformedUri, setTransformedUri] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    loadRecordings();
    fetchModels();
  }, []);

  // Function to load recordings from the file system
  const loadRecordings = async () => {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    setRecordings(files);
  };

  // Function to fetch available models from the server
  const fetchModels = async () => {
    try {
      const response = await axios.get(`http://${serverIp}:${serverPort}/getmodels`);
      setModels(response.data.models);
    } catch (error) {
      console.error('Failed to fetch models', error);
    }
  };

  // Function to select a model for transformation
  const selectModel = async (model) => {
    try {
      await axios.post(`http://${serverIp}:${serverPort}/selectModel/${model}`);
      setSelectedModel(model);
    } catch (error) {
      console.error('Failed to select model', error);
    }
  };

  // Function to upload a recording to the server for transformation
  const uploadRecording = async () => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'audio/wav',
      name: 'recording.wav'
    });

    try {
      await axios.post(`http://${serverIp}:${serverPort}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload file', error);
    }
  };

  // Function to download the transformed recording from the server
  const downloadTransformedRecording = async () => {
    try {
      const response = await axios.get(`http://${serverIp}:${serverPort}/download`, {
        responseType: 'arraybuffer'
      });
      const uri = `${FileSystem.documentDirectory}transformed.wav`;
      await FileSystem.writeAsStringAsync(uri, response.data, { encoding: FileSystem.EncodingType.Base64 });
      setTransformedUri(uri);
    } catch (error) {
      console.error('Failed to download transformed file', error);
    }
  };

  // Function to play the transformed recording
  const playTransformedSound = async () => {
    if (transformedUri) {
      const { sound } = await Audio.Sound.createAsync({ uri: transformedUri });
      await sound.playAsync();
    }
  };

  return (
    <View style={styles.container}>
      <Text>Choose a Model</Text>
      <FlatList
        data={models}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => selectModel(item)}>
            <Text style={selectedModel === item ? styles.selectedModel : styles.model}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <Text>Select a Recording</Text>
      <FlatList
        data={recordings}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedRecording(item)}>
            <Text style={selectedRecording === item ? styles.selectedRecording : styles.recording}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Upload and Transform" onPress={() => uploadRecording(`${FileSystem.documentDirectory}${selectedRecording}`)} />
      <Button title="Download Transformed Recording" onPress={downloadTransformedRecording} />
      <Button title="Play Transformed Recording" onPress={playTransformedSound} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  model: {
    padding: 8,
    backgroundColor: '#ccc',
    marginVertical: 4,
  },
  selectedModel: {
    padding: 8,
    backgroundColor: '#0f0',
    marginVertical: 4,
  },
  recording: {
    padding: 8,
    backgroundColor: '#ccc',
    marginVertical: 4,
  },
  selectedRecording: {
    padding: 8,
    backgroundColor: '#0f0',
    marginVertical: 4,
  },
});