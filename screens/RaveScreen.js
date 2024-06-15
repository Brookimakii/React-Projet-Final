import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import RNFS from 'react-native-fs';

export default function RaveScreen({ route }) {
  const { audioFile, serverIp } = route.params;
  const [transformedAudio, setTransformedAudio] = useState(null);

  const transformAudio = async () => {
    const formData = new FormData();
    formData.append('audio', {
      uri: `file://${audioFile}`,
      type: 'audio/wav',
      name: 'audio.wav',
    });

    try {
      const response = await axios.post(`http://${serverIp}:5000/transform`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'arraybuffer',
      });

      const transformedAudioPath = `${RNFS.DocumentDirectoryPath}/transformed_audio.wav`;
      await RNFS.writeFile(transformedAudioPath, response.data, 'base64');
      setTransformedAudio(transformedAudioPath);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Transform Audio" onPress={transformAudio} />
      {transformedAudio && (
        <View>
          <Text>Transformed Audio Path: {transformedAudio}</Text>
          {/* Add functionality to play the transformed audio */}
        </View>
      )}
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