import React, { useState } from 'react';
import {Button, TextInput, View} from "react-native";
import axios from "axios";

export default function HomeScreen({ navigation }) {
  // State variables to store IP address and port
  const [serverIp, setServerIp] = useState('');
  const [serverPort, setServerPort] = useState('');
  
  // Function to test the connection to the server
  const testConnection = async () => {
    try {
      // Make a GET request to the server
      const response = await axios.get(`http://${serverIp}:${serverPort}/`);
      if (response.status === 200) {
        ToastAndroid.show('Connection success!', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Failed to connect to server', error);
      ToastAndroid.show('Failed to connect to server', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect to Server</Text>
      {/* Inputs for the URL */}
      <TextInput
        style={styles.input}
        placeholder="Enter the ip address"
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
      {/* Connect */}
      <Button title="Connexion Test" onPress={testConnection} />
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