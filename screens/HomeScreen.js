import React, { useState } from 'react';
import {Button, TextInput, View} from "react-native";

export default function HomeScreen({ navigation }) {
  const [serverIp, setServerIp] = useState('');

  const connectToServer = () => {
    if (serverIp) {
      navigation.navigate('Record', { serverIp });
    } else {
      alert('Please enter the server IP address');
    }
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
      <Button title="Connect" onPress={connectToServer} />
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