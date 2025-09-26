import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import PageStructure from '../../../components/PageStructure';
import { useLogadoContext } from '../../../context/logadoContext';
import CardPost from '../../../components/CardPost';
import { PostProps } from '../../../types/Post';
import { atualizaPosts } from '../../../services/posts';

export default function Social() {

  const { posts, setPosts } = useLogadoContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {      
      await atualizaPosts(setPosts);
    } catch (error) {
      console.error("Erro ao atualizar sugestões:", error);
    } finally {
      setRefreshing(false);
    }
  }, [atualizaPosts]);

  return (
    <PageStructure title="Social" icon="globe" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.container}>
        {posts.map((post: PostProps) => (
          <View key={post._id} style={styles.cardWrapper}>
            <CardPost {...post} />
          </View>
        ))}
      </View>
    </PageStructure>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
    marginBottom: 50,
  },
  cardWrapper: {
    width: "80%",
    height: 475,
  },
});