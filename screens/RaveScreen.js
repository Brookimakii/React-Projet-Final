import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import axios from 'axios';
import { Buffer } from 'buffer';

function DefaultSoundRoute() {
  // Assuming you have a default sound in assets
  const defaultSoundUri = FileSystem.documentDirectory + 'default_sound.wav';

  return (
    <View style={styles.tabContainer}>
      <Button title="Load Default Sound" onPress={() => {}} />
    </View>
  );
};

function RecordingsRoute({ recordings, onSelect }) {
  return(
    <View style={styles.tabContainer}>
      <FlatList
        data={recordings}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(`${FileSystem.documentDirectory}${item}`)}>
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
};

function FilePickerRoute({ onSelect }) {
  const pickFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result.type === 'success') {
      onSelect(result.uri);
    }
  };

  return (
    <View style={styles.tabContainer}>
      <Button title="Pick a File" onPress={pickFile} />
    </View>
  );
};

export default function RaveScreen({ route }) {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'default', title: 'Default' },
    { key: 'recordings', title: 'Recordings' },
    { key: 'filePicker', title: 'File Picker' },
  ]);
  const [selectedUri, setSelectedUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transformedAudio, setTransformedAudio] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [playbackInstance, setPlaybackInstance] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    setRecordings(files);
  };

  const handleSelectUri = (uri) => {
    setSelectedUri(uri);
  };

  const transformAudio = async () => {
    if (!selectedUri) {
      alert('Please select an audio file first');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('audio', {
      uri: selectedUri,
      type: 'audio/wav',
      name: 'audio.wav',
    });

    try {
      const { serverIp, serverPort } = route.params;
      await axios.post(`http://${serverIp}:${serverPort}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const response = await axios.get(`http://${serverIp}:${serverPort}/download`, {
        responseType: 'arraybuffer',
      });

      const transformedAudioPath = `${FileSystem.documentDirectory}transformed_audio.wav`;
      const buffer = Buffer.from(response.data, 'binary');
      await FileSystem.writeFile(transformedAudioPath, buffer.toString('base64'), 'base64');
      setTransformedAudio(transformedAudioPath);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const playPauseAudio = async (uri) => {
    if (isPlaying) {
      await playbackInstance.pauseAsync();
      setIsPlaying(false);
    } else {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setPlaybackInstance(sound);
      await sound.playAsync();
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isPlaying) {
          setIsPlaying(false);
        }
      });
    }
  };

  const renderScene = SceneMap({
    default: DefaultSoundRoute,
    recordings: () => <RecordingsRoute recordings={recordings} onSelect={handleSelectUri} />,
    filePicker: () => <FilePickerRoute onSelect={handleSelectUri} />,
  });

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: styles.container.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: 'blue' }}
            style={{ backgroundColor: 'white' }}
            labelStyle={{ color: 'black' }}
          />
        )}
      />
      {selectedUri && (
        <>
          <Button title="Transform Audio" onPress={transformAudio} />
          {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
          <View style={styles.playbackContainer}>
            <Button title="Play Original" onPress={() => playPauseAudio(selectedUri)} />
            {transformedAudio && <Button title="Play Transformed" onPress={() => playPauseAudio(transformedAudio)} />}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
});
