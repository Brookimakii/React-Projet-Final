import React, { useState } from 'react';
import {Button, TextInput, View} from "react-native";
import axios from "axios";

export default function HomeScreen({ navigation }) {
  const [serverIp, setServerIp] = useState('');
  const [serverPort, setServerPort] = useState('');

  const testConnection = () => {
    const url = `http://${serverIp}:${serverPort}/`;
    axios.get(url)
      .then(response => {
        if (response.data === "Connexion success !") {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Connected to the server successfully!',
          });
          navigation.navigate('Record', { serverIp, serverPort });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Unexpected response from the server.',
          });
        }
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: `Failed to connect to the server: ${error.message}`,
        });
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect to Server</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter server IP"
        value={serverIp}
        onChangeText={setServerIp}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter server port"
        value={serverPort}
        onChangeText={setServerPort}
        keyboardType="numeric"
      />
      <Button title="Test Connection" onPress={testConnection} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    marginBottom: 16,
  },
});