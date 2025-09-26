import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  setRating?: (value: number) => void; // Se fornecido, torna o componente interativo
  size?: number; // Permite ajustar o tamanho das estrelas
  color?: string; // Permite mudar a cor das estrelas
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  setRating,
  size = 32,
  color = '#1D5FA3',
}) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((value) => (
        <TouchableOpacity
          key={value}
          onPress={() => setRating && setRating(value)}
          disabled={!setRating} // Desativa clique se não for interativo
        >
          <Ionicons
            name={value <= rating ? 'star' : 'star-outline'}
            size={size}
            color={color}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  starsContainer: {
    flexDirection: 'row',
    gap: 5,
  },
});

export default StarRating;