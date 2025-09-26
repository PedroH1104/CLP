import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface ErrorTextProps {
  texto: string;
}

export default function ErrorText({ texto }: ErrorTextProps) {
  return <Text style={styles.errorText}>{texto}</Text>;
}

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});